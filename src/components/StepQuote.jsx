import { useEffect, useState } from 'react';
import { useQuote, useQuoteDispatch } from '../context/QuoteContext';
import { usePricing } from '../context/PricingContext';
import { WINDOW_TYPES, DOOR_TYPES, SLIDING_DOOR_TYPES, DOOR_VARIANTS, findPriceEntry, calcLineItem } from '../data/products';
import { supabase } from '../lib/supabase';
import {
  Download,
  Calendar,
  CreditCard,
  Phone,
  Shield,
  Clock,
  CheckCircle,
  FileText,
  Printer,
  RotateCcw,
  Loader2,
  AlertCircle,
  Mail,
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

  // Submit quote to Supabase on mount (once)
  useEffect(() => {
    if (state.quoteGenerated || submitted) return;
    submitQuote();
  }, []);

  async function submitQuote() {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Insert quote row
      const { data: quoteRow, error: quoteErr } = await supabase
        .from('quotes')
        .insert({
          quote_number: '', // trigger fills this
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

      // 2. Insert quote items
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

      // 3. Send email via Edge Function (non-blocking — don't fail if email errors)
      try {
        await supabase.functions.invoke('submit-quote', {
          body: { quoteId: quoteRow.id },
        });
      } catch (_) {
        // Email failure doesn't block the quote
      }

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
      <div className="max-w-md mx-auto px-4 py-24 text-center animate-fade-in">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Generating Your Quote</h2>
        <p className="text-gray-500">Saving your details and sending a confirmation email…</p>
      </div>
    );
  }

  if (submitError) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center animate-fade-in">
        <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Something Went Wrong</h2>
        <p className="text-gray-500 mb-6">{submitError}</p>
        <button
          onClick={submitQuote}
          className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-light cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-slide-up">
      {/* Quote Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl p-6 sm:p-8 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-6 h-6 text-accent" />
              <span className="text-sm font-medium text-blue-200">Two Doors Plus USA</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-1">Your Guaranteed Quote</h2>
            <p className="text-blue-200 text-sm">
              Quote #{state.quoteId || '…'} &middot; {priceList?.name ?? 'Current Price List'}
            </p>
          </div>
          <div className="text-right">
            {hasPrices ? (
              <>
                <div className="text-4xl sm:text-5xl font-extrabold text-accent">
                  ${Math.round(total).toLocaleString()}
                </div>
                <div className="text-sm text-blue-200 mt-1">Total Project Cost</div>
              </>
            ) : (
              <div className="text-lg text-blue-200 font-semibold">
                Custom quote — team will follow up
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
            <Calendar className="w-4 h-4" />
            <span>Issued: {formatDate(quoteDate)}</span>
          </div>
          <div className="flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-lg font-semibold">
            <Clock className="w-4 h-4" />
            <span>Valid until: {formatDate(expiryDate)}</span>
          </div>
        </div>
      </div>

      {/* Email confirmation notice */}
      {submitted && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <Mail className="w-5 h-5 text-success flex-shrink-0" />
          <div className="text-sm">
            <span className="font-semibold text-success">Quote sent!</span>{' '}
            <span className="text-gray-600">A copy has been emailed to {state.clientInfo.email}</span>
          </div>
        </div>
      )}

      {/* Project Details */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" /> Project Details
        </h3>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div><span className="text-gray-400">Client:</span>{' '}<span className="text-gray-900 font-medium">{state.clientInfo.firstName} {state.clientInfo.lastName}</span></div>
          <div><span className="text-gray-400">Email:</span>{' '}<span className="text-gray-900">{state.clientInfo.email}</span></div>
          <div><span className="text-gray-400">Phone:</span>{' '}<span className="text-gray-900">{state.clientInfo.phone}</span></div>
          <div><span className="text-gray-400">Property:</span>{' '}<span className="text-gray-900">{state.clientInfo.address}{state.clientInfo.city ? `, ${state.clientInfo.city}` : ''} {state.clientInfo.zip}</span></div>
          <div><span className="text-gray-400">Measurement:</span>{' '}<span className="text-gray-900 capitalize">{state.measureFrom}</span></div>
          <div><span className="text-gray-400">Price list:</span>{' '}<span className="text-gray-900">{priceList?.name ?? '—'}</span></div>
        </div>
      </div>

      {/* Bill of Materials */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Bill of Materials
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">#</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Item</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Size (W×H)</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-center">Qty</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-right">Unit Price</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((li, i) => (
                <tr key={li.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{li.label || getTypeName(li)}</div>
                    <div className="text-xs text-gray-400">
                      {getTypeName(li)}{li.doorStyle ? ` · ${DOOR_VARIANTS[li.doorStyle]}` : ''}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{li.width}" × {li.height}"</td>
                  <td className="px-4 py-3 text-center text-gray-600">{li.qty}</td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {li.calc ? `$${Math.round(li.calc.unitTotal).toLocaleString()}` : <span className="text-amber-500 text-xs">TBD</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {li.calc ? `$${Math.round(li.calc.lineTotal).toLocaleString()}` : <span className="text-amber-500 text-xs">TBD</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        {hasPrices && (
          <div className="border-t-2 border-gray-200 p-5">
            <div className="max-w-xs ml-auto space-y-2 text-sm">
              <div className="flex justify-between border-t pt-3 mt-3 border-gray-200">
                <span className="font-bold text-gray-900 text-lg">Total (incl. installation)</span>
                <span className="font-extrabold text-lg text-primary">
                  ${Math.round(total).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Guarantee Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-gray-900 mb-1">Price Guarantee</h4>
            <p className="text-sm text-gray-600">
              This quote is guaranteed for 5 days, subject to measurement verification and local code
              compliance. Final pricing confirmed after the complimentary expert visit.
            </p>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-4 text-lg">Ready to Move Forward?</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <button className="flex items-center gap-3 p-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary-light transition-colors cursor-pointer">
            <CreditCard className="w-6 h-6" />
            <div className="text-left">
              <div>Secure with Deposit</div>
              <div className="text-xs font-normal text-blue-200">Lock in your price today</div>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-white border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary/5 transition-colors cursor-pointer">
            <Calendar className="w-6 h-6" />
            <div className="text-left">
              <div>Schedule Expert Visit</div>
              <div className="text-xs font-normal text-gray-500">Free — no obligation</div>
            </div>
          </button>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
          <Phone className="w-4 h-4" />
          Or call us at (786) 555-1234
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print Quote
        </button>
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> Start New Quote
        </button>
      </div>

      <div className="text-center text-xs text-gray-400 pb-8">
        <p>This quote is an estimate based on the information provided. Final pricing subject to on-site measurement verification.</p>
        <p className="mt-2">&copy; 2026 Two Doors Plus USA &middot; South Florida</p>
      </div>
    </div>
  );
}
