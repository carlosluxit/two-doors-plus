import { useEffect, useState } from 'react';
import { useQuote, useQuoteDispatch } from '../context/QuoteContext';
import { usePricing } from '../context/PricingContext';
import { WINDOW_TYPES, DOOR_TYPES, SLIDING_DOOR_TYPES, DOOR_VARIANTS, findPriceEntry, calcLineItem } from '../data/products';
import { supabase } from '../lib/supabase';
import {
  Calendar,
  CreditCard,
  Phone,
  Shield,
  Clock,
  FileText,
  Printer,
  RotateCcw,
  Loader2,
  AlertCircle,
  Mail,
  Check,
} from 'lucide-react';

const ALL_TYPES = { ...WINDOW_TYPES, ...DOOR_TYPES, ...SLIDING_DOOR_TYPES };

function getTypeName(item) {
  return ALL_TYPES[item.subType]?.name || item.subType;
}

function buildLineItems(items, priceEntries) {
  return items.map((item) => {
    const entry = findPriceEntry(priceEntries, item.subType, item.width, item.height);
    const calc = calcLineItem(entry, item.doorStyle, item.quantity || 1);
    return { ...item, entry, calc, qty: item.quantity || 1 };
  });
}

export default function StepQuote() {
  const state = useQuote();
  const dispatch = useQuoteDispatch();
  const { priceEntries, priceList } = usePricing();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const quoteDate = new Date();
  const expiryDate = new Date(quoteDate);
  expiryDate.setDate(expiryDate.getDate() + 5);
  const formatDate = (d) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const lineItems = buildLineItems(state.items, priceEntries);
  const itemsSubtotal = lineItems.reduce((sum, li) => sum + (li.calc?.unitSubtotal ?? 0) * li.qty, 0);
  const markupAmount = lineItems.reduce((sum, li) => sum + (li.calc?.unitMarkup ?? 0) * li.qty, 0);
  const total = lineItems.reduce((sum, li) => sum + (li.calc?.lineTotal ?? 0), 0);
  const hasPrices = total > 0;

  useEffect(() => {
    if (state.quoteGenerated || submitted) return;
    submitQuote();
  }, []);

  async function submitQuote() {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const { data: quoteRow, error: quoteErr } = await supabase
        .from('quotes')
        .insert({
          quote_number: '',
          price_list_id: priceList?.id ?? null,
          price_list_name: priceList?.name ?? 'Manual',
          client_first_name: state.clientInfo.firstName,
          client_last_name: state.clientInfo.lastName,
          client_email: state.clientInfo.email,
          client_phone: state.clientInfo.phone,
          client_address: state.clientInfo.address,
          client_city: state.clientInfo.city,
          client_zip: state.clientInfo.zip,
          project_type: state.projectType,
          measure_from: state.measureFrom,
          items_subtotal: Math.round(itemsSubtotal * 100) / 100,
          markup_rate: 0.30,
          markup_amount: Math.round(markupAmount * 100) / 100,
          total: Math.round(total * 100) / 100,
          status: 'pending',
        })
        .select()
        .single();

      if (quoteErr) throw quoteErr;

      const quoteItems = lineItems.map((li, idx) => ({
        quote_id: quoteRow.id,
        item_category: li.itemCategory,
        product_type: li.subType,
        label: li.label || null,
        width: li.width,
        height: li.height,
        quantity: li.qty,
        door_variant: li.doorStyle || null,
        base_price: li.calc?.basePrice ?? 0,
        install_fee: li.calc?.installFee ?? 0,
        unit_subtotal: li.calc?.unitSubtotal ?? 0,
        unit_markup: li.calc?.unitMarkup ?? 0,
        unit_total: li.calc?.unitTotal ?? 0,
        line_total: li.calc?.lineTotal ?? 0,
        sort_order: idx,
      }));

      const { error: itemsErr } = await supabase.from('quote_items').insert(quoteItems);
      if (itemsErr) throw itemsErr;

      try {
        await supabase.functions.invoke('submit-quote', {
          body: { quoteId: quoteRow.id },
        });
      } catch (_) {}

      dispatch({
        type: 'GENERATE_QUOTE',
        quoteId: quoteRow.quote_number,
        quoteData: quoteRow,
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Quote submission error:', err);
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitting) {
    return (
      <div className="max-w-sm mx-auto px-5 py-24 text-center animate-fade-in">
        <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-4" strokeWidth={1.5} />
        <h2 className="text-lg font-semibold text-primary mb-1.5">Generating Your Quote</h2>
        <p className="text-sm text-muted">Saving your details and sending confirmation...</p>
      </div>
    );
  }

  if (submitError) {
    return (
      <div className="max-w-sm mx-auto px-5 py-24 text-center animate-fade-in">
        <AlertCircle className="w-8 h-8 text-danger mx-auto mb-4" strokeWidth={1.5} />
        <h2 className="text-lg font-semibold text-primary mb-1.5">Something Went Wrong</h2>
        <p className="text-sm text-muted mb-6">{submitError}</p>
        <button
          onClick={submitQuote}
          className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-light cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 animate-slide-up">
      {/* Quote Header */}
      <div className="bg-primary text-white rounded-xl p-6 sm:p-8 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-accent" strokeWidth={1.5} />
              <span className="text-[11px] font-medium text-stone-400 uppercase tracking-widest">Two Doors Plus USA</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-1">Your Guaranteed Quote</h2>
            <p className="text-stone-400 text-xs">
              Quote #{state.quoteId || '\u2026'} &middot; {priceList?.name ?? 'Current Price List'}
            </p>
          </div>
          <div className="text-right">
            {hasPrices ? (
              <>
                <div className="text-3xl sm:text-4xl font-semibold text-accent">
                  ${Math.round(total).toLocaleString()}
                </div>
                <div className="text-[11px] text-stone-400 mt-1">Total Project Cost</div>
              </>
            ) : (
              <div className="text-sm text-stone-400">
                Custom quote — team will follow up
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-md">
            <Calendar className="w-3.5 h-3.5 text-stone-400" strokeWidth={1.5} />
            <span className="text-stone-300">Issued: {formatDate(quoteDate)}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-accent/15 text-accent px-3 py-1.5 rounded-md font-medium">
            <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Valid until: {formatDate(expiryDate)}</span>
          </div>
        </div>
      </div>

      {/* Email notice */}
      {submitted && (
        <div className="flex items-center gap-2.5 bg-success/5 border border-success/20 rounded-lg p-3.5 mb-6">
          <Mail className="w-4 h-4 text-success flex-shrink-0" strokeWidth={1.5} />
          <div className="text-xs">
            <span className="font-medium text-success">Quote sent</span>{' '}
            <span className="text-muted">to {state.clientInfo.email}</span>
          </div>
        </div>
      )}

      {/* Project Details */}
      <div className="border border-border rounded-lg p-5 mb-6">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" strokeWidth={1.5} /> Project Details
        </h3>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div><span className="text-muted text-xs">Client</span>{' '}<span className="text-primary font-medium">{state.clientInfo.firstName} {state.clientInfo.lastName}</span></div>
          <div><span className="text-muted text-xs">Email</span>{' '}<span className="text-primary">{state.clientInfo.email}</span></div>
          <div><span className="text-muted text-xs">Phone</span>{' '}<span className="text-primary">{state.clientInfo.phone}</span></div>
          <div><span className="text-muted text-xs">Property</span>{' '}<span className="text-primary">{state.clientInfo.address}{state.clientInfo.city ? `, ${state.clientInfo.city}` : ''} {state.clientInfo.zip}</span></div>
          <div><span className="text-muted text-xs">Measurement</span>{' '}<span className="text-primary capitalize">{state.measureFrom}</span></div>
          <div><span className="text-muted text-xs">Price list</span>{' '}<span className="text-primary">{priceList?.name ?? '\u2014'}</span></div>
        </div>
      </div>

      {/* Bill of Materials */}
      <div className="border border-border rounded-lg overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-widest flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" strokeWidth={1.5} /> Bill of Materials
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-left">
                <th className="px-4 py-2.5 text-[10px] font-semibold text-muted uppercase tracking-wide">#</th>
                <th className="px-4 py-2.5 text-[10px] font-semibold text-muted uppercase tracking-wide">Item</th>
                <th className="px-4 py-2.5 text-[10px] font-semibold text-muted uppercase tracking-wide">Size</th>
                <th className="px-4 py-2.5 text-[10px] font-semibold text-muted uppercase tracking-wide text-center">Qty</th>
                <th className="px-4 py-2.5 text-[10px] font-semibold text-muted uppercase tracking-wide text-right">Price</th>
                <th className="px-4 py-2.5 text-[10px] font-semibold text-muted uppercase tracking-wide text-right">Installation</th>
                <th className="px-4 py-2.5 text-[10px] font-semibold text-muted uppercase tracking-wide text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((li, i) => (
                <tr key={li.id} className="border-t border-border hover:bg-stone-50/50">
                  <td className="px-4 py-3 text-xs text-muted">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs font-medium text-primary">{li.label || getTypeName(li)}</div>
                    <div className="text-[11px] text-muted">
                      {getTypeName(li)}{li.doorStyle ? ` \u00B7 ${DOOR_VARIANTS[li.doorStyle]}` : ''}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-stone-600">{li.width}" \u00D7 {li.height}"</td>
                  <td className="px-4 py-3 text-center text-xs text-stone-600">{li.qty}</td>
                  <td className="px-4 py-3 text-right text-xs text-stone-600">
                    {li.calc ? `$${Math.round(li.calc.displayPrice).toLocaleString()}` : <span className="text-accent text-[11px]">TBD</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-stone-600">
                    {li.calc ? `$${Math.round(li.calc.displayInstall).toLocaleString()}` : <span className="text-accent text-[11px]">TBD</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-semibold text-primary">
                    {li.calc ? `$${Math.round(li.calc.lineTotal).toLocaleString()}` : <span className="text-accent text-[11px]">TBD</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {hasPrices && (
          <div className="border-t border-border px-5 py-4">
            <div className="max-w-xs ml-auto">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-primary">Total</span>
                <span className="text-lg font-semibold text-accent">
                  ${Math.round(total).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Guarantee */}
      <div className="bg-accent/5 border border-accent/20 rounded-lg p-5 mb-6">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <h4 className="text-sm font-semibold text-primary mb-1">Price Guarantee</h4>
            <p className="text-xs text-muted leading-relaxed">
              This quote is guaranteed for 5 days, subject to measurement verification and local code
              compliance. Final pricing confirmed after the complimentary expert visit.
            </p>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="border border-border rounded-lg p-5 mb-6">
        <h3 className="text-sm font-semibold text-primary mb-4">Ready to Move Forward?</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <button className="flex items-center gap-3 p-3.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition-colors cursor-pointer">
            <CreditCard className="w-5 h-5" strokeWidth={1.5} />
            <div className="text-left">
              <div>Secure with Deposit</div>
              <div className="text-[11px] font-normal text-stone-400">Lock in your price today</div>
            </div>
          </button>
          <button className="flex items-center gap-3 p-3.5 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary/5 transition-colors cursor-pointer">
            <Calendar className="w-5 h-5" strokeWidth={1.5} />
            <div className="text-left">
              <div>Schedule Expert Visit</div>
              <div className="text-[11px] font-normal text-muted">Free — no obligation</div>
            </div>
          </button>
        </div>
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
          <Phone className="w-3.5 h-3.5" strokeWidth={1.5} />
          Or call us at (786) 555-1234
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium text-muted hover:text-primary hover:bg-stone-50 transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" strokeWidth={1.5} /> Print
        </button>
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium text-muted hover:text-primary hover:bg-stone-50 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} /> New Quote
        </button>
      </div>

      <div className="text-center text-[11px] text-stone-400 pb-8">
        <p>This quote is an estimate based on the information provided. Final pricing subject to on-site measurement verification.</p>
        <p className="mt-1.5">&copy; 2026 Two Doors Plus USA &middot; South Florida</p>
      </div>
    </div>
  );
}
