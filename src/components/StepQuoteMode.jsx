import { Fragment } from 'react';
import { useQuote, useQuoteDispatch } from '../context/QuoteContext';
import { ArrowRight, ArrowLeft, Zap, SlidersHorizontal, Check } from 'lucide-react';

const OPTIONS = [
  {
    key: 'quick',
    icon: Zap,
    title: 'Quick & Easy',
    tagline: 'Get a price in less steps.',
    desc: 'Just enter approximate width and height. We price it using a standard window configuration.',
  },
  {
    key: 'detailed',
    icon: SlidersHorizontal,
    title: 'Detailed Selection',
    tagline: 'Choose your window styles and specifications.',
    desc: 'Pick Single Hung, Horizontal Roller, special shapes, glass type and more before measuring.',
  },
];

export default function StepQuoteMode() {
  const state = useQuote();
  const dispatch = useQuoteDispatch();
  const selected = state.quoteMode;

  return (
    <div className="max-w-lg mx-auto px-5 py-14 animate-fade-in">
      <h2 className="text-xl font-semibold text-primary text-center mb-1.5">
        How Would You Like to Select Your Windows?
      </h2>
      <p className="text-sm text-muted text-center mb-10">
        Choose below the experience that works best for you.
      </p>

      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2 sm:gap-3 mb-8">
        {OPTIONS.map(({ key, icon: Icon, title, tagline, desc }, i) => {
          const active = selected === key;
          return (
            <Fragment key={key}>
            {i > 0 && (
              <div className="flex items-center justify-center">
                <span className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center text-xs font-bold text-primary uppercase">Or</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_QUOTE_MODE', quoteMode: key })}
              className={`relative rounded-lg border p-5 text-left transition-all cursor-pointer ${
                active ? 'border-accent bg-accent/5' : 'border-border bg-white hover:border-slate-300'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                active ? 'bg-accent/10 text-accent' : 'bg-slate-50 text-muted'
              }`}>
                <Icon className="w-4.5 h-4.5" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-bold text-primary leading-tight mb-1.5">{title}</h3>
              <p className="text-xs font-semibold text-slate-700 leading-snug mb-1.5">{tagline}</p>
              <p className="text-[11px] text-muted leading-relaxed">{desc}</p>
              {active && (
                <div className="absolute top-3 right-3 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </div>
              )}
            </button>
            </Fragment>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => dispatch({ type: 'PREV_STEP' })}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-muted hover:text-primary hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Back
        </button>
        <button
          disabled={!selected}
          onClick={() => dispatch({ type: 'NEXT_STEP' })}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all cursor-pointer ${
            selected
              ? 'bg-amber-400 text-primary hover:bg-amber-300 shadow-lg shadow-amber-400/30'
              : 'bg-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >
          Continue <ArrowRight className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
