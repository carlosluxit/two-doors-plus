import { useQuote, useQuoteDispatch } from '../context/QuoteContext';
import { ArrowRight, PanelTop, DoorOpen, Home, PanelLeftOpen } from 'lucide-react';

const PROJECT_TYPES = [
  {
    id: 'windows',
    icon: PanelTop,
    title: 'Windows Only',
    desc: 'Hurricane impact windows (3 minimum)',
  },
  {
    id: 'doors',
    icon: DoorOpen,
    title: 'Doors Only',
    desc: 'Hurricane impact entry doors — no minimum',
  },
  {
    id: 'sliding_doors',
    icon: PanelLeftOpen,
    title: 'Sliding Doors',
    desc: 'Sliding glass doors — no minimum',
  },
  {
    id: 'both',
    icon: Home,
    title: 'Windows & Doors',
    desc: 'Complete hurricane protection package',
    popular: true,
  },
];

export default function StepProjectType() {
  const state = useQuote();
  const dispatch = useQuoteDispatch();
  const canProceed = !!state.projectType;

  return (
    <div className="max-w-md mx-auto px-5 py-14 animate-fade-in">
      <h2 className="text-xl font-semibold text-primary text-center mb-1.5">
        What are you looking for?
      </h2>
      <p className="text-sm text-muted text-center mb-10">
        Select the type of hurricane impact products you need.
      </p>

      <div className="space-y-3">
        {PROJECT_TYPES.map(({ id, icon: Icon, title, desc, popular }) => {
          const selected = state.projectType === id;
          return (
            <button
              key={id}
              onClick={() => dispatch({ type: 'SET_PROJECT_TYPE', projectType: id })}
              className={`relative w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-all cursor-pointer ${
                selected
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-white hover:border-slate-300'
              }`}
            >
              {popular && (
                <span className="absolute -top-2.5 right-4 bg-accent text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full tracking-wide uppercase">
                  Popular
                </span>
              )}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                selected ? 'bg-accent/10' : 'bg-slate-50'
              }`}>
                <Icon className={`w-5 h-5 ${selected ? 'text-accent' : 'text-muted'}`} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-primary">{title}</div>
                <div className="text-xs text-muted mt-0.5">{desc}</div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selected ? 'border-accent bg-accent' : 'border-slate-300'
                }`}
              >
                {selected && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex justify-center">
        <button
          disabled={!canProceed}
          onClick={() => dispatch({ type: 'NEXT_STEP' })}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium tracking-wide transition-all cursor-pointer ${
            canProceed
              ? 'bg-primary text-white hover:bg-primary-light'
              : 'bg-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >
          Continue
          <ArrowRight className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
