import { useQuote, useQuoteDispatch } from '../context/QuoteContext';
import { TIERS, calculateFullQuote } from '../data/products';
import { ArrowRight, ArrowLeft, Check, Star } from 'lucide-react';

export default function StepTierSelection() {
  const state = useQuote();
  const dispatch = useQuoteDispatch();

  const tiers = Object.entries(TIERS);
  const canProceed = !!state.selectedTier;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
        Choose Your Protection Level
      </h2>
      <p className="text-gray-500 text-center mb-8">
        All tiers are Miami-Dade NOA approved and meet Florida building codes.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map(([key, tier]) => {
          const quote = calculateFullQuote(state.items, key);
          const isSelected = state.selectedTier === key;
          const isPremium = key === 'premium';

          return (
            <div
              key={key}
              onClick={() => dispatch({ type: 'SET_TIER', tier: key })}
              className={`relative rounded-2xl border-2 p-6 transition-all cursor-pointer ${
                isSelected
                  ? 'border-primary shadow-xl scale-[1.02]'
                  : isPremium
                  ? 'border-premium/30 shadow-md hover:border-premium/60'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              {isPremium && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-premium text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" /> MOST POPULAR
                </div>
              )}

              {/* Badge */}
              <div
                className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4"
                style={{
                  backgroundColor: tier.color + '15',
                  color: tier.color,
                }}
              >
                {tier.badge}
              </div>

              <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{tier.tagline}</p>

              {/* Price */}
              <div className="mb-4">
                <div className="text-3xl font-extrabold text-gray-900">
                  ${quote.grandTotal.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">
                  Total project estimate ({quote.unitCount} unit{quote.unitCount !== 1 ? 's' : ''})
                </div>
              </div>

              {/* Manufacturer */}
              <div className="text-sm text-gray-600 mb-1 font-medium">{tier.manufacturer}</div>
              <div className="text-xs text-gray-400 mb-4">{tier.warranty}</div>

              {/* Features */}
              <ul className="space-y-2 mb-6">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Select Button */}
              <button
                className={`w-full py-3 rounded-xl font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={isSelected ? { backgroundColor: tier.color } : {}}
              >
                {isSelected ? 'Selected' : 'Select ' + tier.name}
              </button>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={() => dispatch({ type: 'PREV_STEP' })}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <button
          disabled={!canProceed}
          onClick={() => dispatch({ type: 'NEXT_STEP' })}
          className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-lg transition-all cursor-pointer ${
            canProceed
              ? 'bg-primary text-white hover:bg-primary-light'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
