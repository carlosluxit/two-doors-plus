import { useQuote, useQuoteDispatch } from '../context/QuoteContext';
import { ArrowRight } from 'lucide-react';

const PROJECT_TYPES = [
  {
    id: 'windows',
    emoji: '🪟',
    title: 'Windows Only',
    desc: 'Hurricane impact windows for your home',
  },
  {
    id: 'doors',
    emoji: '🚪',
    title: 'Doors Only',
    desc: 'Hurricane impact entry & sliding doors',
  },
  {
    id: 'both',
    emoji: '🏠',
    title: 'Windows & Doors',
    desc: 'Complete hurricane protection package',
    popular: true,
  },
];

export default function StepProjectType() {
  const state = useQuote();
  const dispatch = useQuoteDispatch();

  const handleSelect = (type) => {
    dispatch({ type: 'SET_PROJECT_TYPE', projectType: type });
  };

  const canProceed = !!state.projectType;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
        What are you looking for?
      </h2>
      <p className="text-gray-500 text-center mb-8">
        Select the type of hurricane impact products you need.
      </p>

      <div className="grid gap-4">
        {PROJECT_TYPES.map(({ id, emoji, title, desc, popular }) => (
          <button
            key={id}
            onClick={() => handleSelect(id)}
            className={`relative flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all cursor-pointer ${
              state.projectType === id
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            {popular && (
              <span className="absolute -top-2.5 right-4 bg-accent text-primary-dark text-xs font-bold px-3 py-0.5 rounded-full">
                Most Popular
              </span>
            )}
            <span className="text-3xl">{emoji}</span>
            <div>
              <div className="font-semibold text-gray-900 text-lg">{title}</div>
              <div className="text-sm text-gray-500">{desc}</div>
            </div>
            <div
              className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                state.projectType === id ? 'border-primary bg-primary' : 'border-gray-300'
              }`}
            >
              {state.projectType === id && (
                <div className="w-2.5 h-2.5 bg-white rounded-full" />
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          disabled={!canProceed}
          onClick={() => dispatch({ type: 'NEXT_STEP' })}
          className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-lg transition-all cursor-pointer ${
            canProceed
              ? 'bg-primary text-white hover:bg-primary-light'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
