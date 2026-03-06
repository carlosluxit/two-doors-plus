import { useQuote, useQuoteDispatch } from '../context/QuoteContext';
import { calculateFullQuote, TIERS, WINDOW_TYPES, DOOR_TYPES } from '../data/products';
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
} from 'lucide-react';

export default function StepQuote() {
  const state = useQuote();
  const dispatch = useQuoteDispatch();
  const quote = calculateFullQuote(state.items, state.selectedTier);
  const tier = quote.tier;

  const quoteDate = new Date();
  const expiryDate = new Date(quoteDate);
  expiryDate.setDate(expiryDate.getDate() + 5);

  const formatDate = (d) =>
    d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const getTypeName = (item) => {
    const types = item.itemType === 'window' ? WINDOW_TYPES : DOOR_TYPES;
    return types[item.subType]?.name || item.subType;
  };

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
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-1">
              Your Guaranteed Quote
            </h2>
            <p className="text-blue-200 text-sm">
              Quote #{state.quoteId} &middot; {tier.name} Tier
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl sm:text-5xl font-extrabold text-accent">
              ${quote.grandTotal.toLocaleString()}
            </div>
            <div className="text-sm text-blue-200 mt-1">Total Project Cost</div>
          </div>
        </div>

        {/* Quote validity */}
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

      {/* Client Info Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" /> Project Details
        </h3>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div>
            <span className="text-gray-400">Client:</span>{' '}
            <span className="text-gray-900 font-medium">
              {state.clientInfo.firstName} {state.clientInfo.lastName}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Email:</span>{' '}
            <span className="text-gray-900">{state.clientInfo.email}</span>
          </div>
          <div>
            <span className="text-gray-400">Phone:</span>{' '}
            <span className="text-gray-900">{state.clientInfo.phone}</span>
          </div>
          <div>
            <span className="text-gray-400">Property:</span>{' '}
            <span className="text-gray-900">
              {state.clientInfo.address}, {state.clientInfo.city} {state.clientInfo.zip}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Tier:</span>{' '}
            <span className="font-semibold" style={{ color: tier.color }}>
              {tier.name}
            </span>{' '}
            <span className="text-gray-400">({tier.manufacturer})</span>
          </div>
          <div>
            <span className="text-gray-400">Warranty:</span>{' '}
            <span className="text-gray-900">{tier.warranty}</span>
          </div>
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
                <th className="px-5 py-3 font-semibold text-gray-600">#</th>
                <th className="px-5 py-3 font-semibold text-gray-600">Item</th>
                <th className="px-5 py-3 font-semibold text-gray-600">Size (W x H)</th>
                <th className="px-5 py-3 font-semibold text-gray-600 text-center">Qty</th>
                <th className="px-5 py-3 font-semibold text-gray-600 text-right">Product</th>
                <th className="px-5 py-3 font-semibold text-gray-600 text-right">Install</th>
                <th className="px-5 py-3 font-semibold text-gray-600 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.lineItems.map((item, i) => (
                <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-gray-900">
                      {item.label || getTypeName(item)}
                    </div>
                    <div className="text-xs text-gray-400">{getTypeName(item)}</div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {item.width}" x {item.height}"
                  </td>
                  <td className="px-5 py-3 text-center text-gray-600">{item.qty}</td>
                  <td className="px-5 py-3 text-right text-gray-900">
                    ${(item.unitPrice.product * item.qty).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-right text-gray-600">
                    ${(item.unitPrice.installation * item.qty).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-gray-900">
                    ${item.lineTotal.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t-2 border-gray-200 p-5">
          <div className="max-w-xs ml-auto space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Products Subtotal</span>
              <span className="text-gray-900">${quote.totalProduct.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Installation</span>
              <span className="text-gray-900">${quote.totalInstall.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Trim Package ({quote.unitCount} units)</span>
              <span className="text-gray-900">${quote.totalTrim.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Debris Removal</span>
              <span className="text-gray-900">${quote.totalDebris.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Permit Fees</span>
              <span className="text-gray-900">${quote.permit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Inspection Fee</span>
              <span className="text-gray-900">${quote.inspection.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t pt-3 mt-3 border-gray-200">
              <span className="font-bold text-gray-900 text-lg">Grand Total</span>
              <span className="font-extrabold text-lg" style={{ color: tier.color }}>
                ${quote.grandTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Guarantee Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-gray-900 mb-1">Price Guarantee</h4>
            <p className="text-sm text-gray-600">
              This quote is guaranteed for 5 days, subject to measurement verification
              and local code compliance confirmation during your expert visit. Final
              pricing will be confirmed after the complimentary verification visit.
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
        <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">
          <Download className="w-4 h-4" /> Download PDF
        </button>
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> Start New Quote
        </button>
      </div>

      {/* Footer disclaimer */}
      <div className="text-center text-xs text-gray-400 pb-8">
        <p>
          This quote is an estimate based on the information provided. Final pricing subject
          to on-site measurement verification and local building code requirements.
        </p>
        <p className="mt-2">&copy; 2026 Two Doors Plus USA &middot; South Florida</p>
      </div>
    </div>
  );
}
