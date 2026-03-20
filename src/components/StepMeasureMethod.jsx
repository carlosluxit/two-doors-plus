import { useState, useEffect } from 'react';
import { useQuote, useQuoteDispatch } from '../context/QuoteContext';
import { ArrowRight, ArrowLeft, Home, Square, X, AlertTriangle, Info, Check } from 'lucide-react';

function OutsideImages() {
  return (
    <div className="space-y-2">
      <img src="/outside_1.GIF" alt="Measure edge to edge from outside" className="w-full rounded-lg" />
      <img src="/outside_2.GIF" alt="Measure sill to top from outside" className="w-full rounded-lg" />
    </div>
  );
}

function InsideImages() {
  return (
    <div className="space-y-2">
      <img src="/inside_1.GIF" alt="Measure wall to wall from inside" className="w-full rounded-lg" />
      <img src="/inside2.GIF" alt="Measure sill to top from inside" className="w-full rounded-lg" />
    </div>
  );
}

export default function StepMeasureMethod() {
  const state = useQuote();
  const dispatch = useQuoteDispatch();
  const hasDoors = state.projectType === 'doors' || state.projectType === 'both';

  const [showDoorsPopup, setShowDoorsPopup] = useState(false);
  const [showWindowsPopup, setShowWindowsPopup] = useState(false);
  const [showInsidePopup, setShowInsidePopup] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [winUnderstood, setWinUnderstood] = useState(false);

  useEffect(() => {
    if (hasDoors) {
      dispatch({ type: 'SET_MEASURE_FROM', measureFrom: 'outside' });
      setShowDoorsPopup(true);
    }
  }, [hasDoors]);

  const selected = state.measureFrom;
  const canContinue = hasDoors ? understood : winUnderstood;

  function pickInside() {
    dispatch({ type: 'SET_MEASURE_FROM', measureFrom: 'inside' });
    setWinUnderstood(false);
    setShowInsidePopup(true);
  }

  function pickOutside() {
    dispatch({ type: 'SET_MEASURE_FROM', measureFrom: 'outside' });
    if (hasDoors) {
      setShowDoorsPopup(true);
    } else {
      setWinUnderstood(false);
      setShowWindowsPopup(true);
    }
  }

  return (
    <div className="max-w-md mx-auto px-5 py-14 animate-fade-in">
      <h2 className="text-xl font-semibold text-primary text-center mb-1.5">
        How Will You Measure?
      </h2>
      <p className="text-sm text-muted text-center mb-10">
        Select where you'll be taking measurements from.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {/* Inside */}
        <button
          type="button"
          disabled={hasDoors}
          onClick={pickInside}
          className={`relative rounded-lg border p-4 text-left transition-all cursor-pointer ${
            selected === 'inside' && !hasDoors
              ? 'border-accent bg-accent/5'
              : hasDoors
              ? 'border-border bg-stone-50 opacity-40 cursor-not-allowed'
              : 'border-border bg-white hover:border-stone-300'
          }`}
        >
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
            selected === 'inside' && !hasDoors ? 'bg-accent/10 text-accent' : 'bg-stone-50 text-muted'
          }`}>
            <Home className="w-4.5 h-4.5" strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-medium text-primary mb-1">From Inside</h3>
          <p className="text-[11px] text-muted leading-relaxed">
            Wall to wall, sill to top of the opening.
          </p>
          {selected === 'inside' && !hasDoors && (
            <div className="absolute top-3 right-3 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
            </div>
          )}
        </button>

        {/* Outside */}
        <button
          type="button"
          onClick={pickOutside}
          className={`relative rounded-lg border p-4 text-left transition-all cursor-pointer ${
            selected === 'outside'
              ? 'border-accent bg-accent/5'
              : 'border-border bg-white hover:border-stone-300'
          }`}
        >
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
            selected === 'outside' ? 'bg-accent/10 text-accent' : 'bg-stone-50 text-muted'
          }`}>
            <Square className="w-4.5 h-4.5" strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-medium text-primary mb-1">From Outside</h3>
          <p className="text-[11px] text-muted leading-relaxed">
            Border to border — full frame dimensions.
          </p>
          {selected === 'outside' && (
            <div className="absolute top-3 right-3 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
            </div>
          )}
          {hasDoors && (
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-accent text-white text-[9px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap tracking-wide uppercase">
              Required for doors
            </span>
          )}
        </button>
      </div>

      {/* Doors: tutorial banner */}
      {hasDoors && !understood && (
        <button
          onClick={() => setShowDoorsPopup(true)}
          className="w-full flex items-center gap-3 border border-accent/30 bg-accent/5 rounded-lg px-4 py-3 mb-6 cursor-pointer hover:bg-accent/10 transition-colors"
        >
          <AlertTriangle className="w-4 h-4 text-accent flex-shrink-0" strokeWidth={1.5} />
          <span className="text-xs text-stone-700 font-medium text-left">
            Doors must be measured from outside — tap to see how
          </span>
        </button>
      )}

      {hasDoors && understood && (
        <div className="flex items-center justify-between border border-success/30 bg-success/5 rounded-lg px-4 py-3 mb-6">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-success" strokeWidth={2} />
            <span className="text-xs text-stone-700 font-medium">Got it — you'll measure from outside</span>
          </div>
          <button onClick={() => setShowDoorsPopup(true)} className="text-[11px] text-muted underline cursor-pointer">Review</button>
        </div>
      )}

      {/* Windows outside banner */}
      {!hasDoors && selected === 'outside' && !winUnderstood && (
        <button
          onClick={() => setShowWindowsPopup(true)}
          className="w-full flex items-center gap-3 border border-accent/30 bg-accent/5 rounded-lg px-4 py-3 mb-6 cursor-pointer hover:bg-accent/10 transition-colors"
        >
          <Info className="w-4 h-4 text-accent flex-shrink-0" strokeWidth={1.5} />
          <span className="text-xs text-stone-700 font-medium text-left">
            Watch how to measure from outside before continuing
          </span>
        </button>
      )}
      {!hasDoors && selected === 'outside' && winUnderstood && (
        <div className="flex items-center justify-between border border-success/30 bg-success/5 rounded-lg px-4 py-3 mb-6">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-success" strokeWidth={2} />
            <span className="text-xs text-stone-700 font-medium">Got it — you'll measure from outside</span>
          </div>
          <button onClick={() => setShowWindowsPopup(true)} className="text-[11px] text-muted underline cursor-pointer">Review</button>
        </div>
      )}

      {/* Inside banner */}
      {!hasDoors && selected === 'inside' && !winUnderstood && (
        <button
          onClick={() => setShowInsidePopup(true)}
          className="w-full flex items-center gap-3 border border-primary/20 bg-primary/5 rounded-lg px-4 py-3 mb-6 cursor-pointer hover:bg-primary/10 transition-colors"
        >
          <Info className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={1.5} />
          <span className="text-xs text-stone-700 font-medium text-left">
            Watch how to measure from inside before continuing
          </span>
        </button>
      )}
      {!hasDoors && selected === 'inside' && winUnderstood && (
        <div className="flex items-center justify-between border border-success/30 bg-success/5 rounded-lg px-4 py-3 mb-6">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-success" strokeWidth={2} />
            <span className="text-xs text-stone-700 font-medium">Got it — you'll measure from inside</span>
          </div>
          <button onClick={() => setShowInsidePopup(true)} className="text-[11px] text-muted underline cursor-pointer">Review</button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => dispatch({ type: 'PREV_STEP' })}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-muted hover:text-primary hover:bg-stone-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Back
        </button>
        <button
          disabled={!canContinue}
          onClick={() => dispatch({ type: 'NEXT_STEP' })}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium tracking-wide transition-all cursor-pointer ${
            canContinue
              ? 'bg-primary text-white hover:bg-primary-light'
              : 'bg-stone-100 text-stone-300 cursor-not-allowed'
          }`}
        >
          Continue <ArrowRight className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      {showDoorsPopup && <MeasurePopup type="outside-doors" onClose={() => { setShowDoorsPopup(false); setUnderstood(true); }} />}
      {showWindowsPopup && <MeasurePopup type="outside-windows" onClose={() => { setShowWindowsPopup(false); setWinUnderstood(true); }} />}
      {showInsidePopup && <MeasurePopup type="inside" onClose={() => { setShowInsidePopup(false); setWinUnderstood(true); }} />}
    </div>
  );
}

/* ── Unified popup ──────────────────────────────────────── */
const POPUP_CONFIG = {
  'outside-doors': {
    title: 'Measuring From Outside',
    subtitle: 'Required for all door measurements',
    icon: AlertTriangle,
    images: OutsideImages,
    showDiagram: true,
    showWhy: true,
    buttonText: "I Understand — I'll Measure From Outside",
    steps: [
      { title: 'Go outside the home', desc: 'Stand outside where you can see the full door frame.' },
      { title: 'Measure the WIDTH', desc: 'Outer edge to outer edge of the frame.' },
      { title: 'Measure the HEIGHT', desc: 'Threshold (bottom sill) to top outer edge.' },
      { title: 'Measure 3 times', desc: 'Use the SMALLEST number from left/center/right and top/middle/bottom.' },
    ],
  },
  'outside-windows': {
    title: 'Measuring From Outside',
    subtitle: 'Window measurement guide',
    icon: Info,
    images: OutsideImages,
    showDiagram: false,
    showWhy: false,
    buttonText: 'Got It — Continue',
    steps: [
      { title: 'Go outside the home', desc: 'Stand outside where you can see the full window frame.' },
      { title: 'Measure the WIDTH', desc: 'Outer edge to outer edge of the frame.' },
      { title: 'Measure the HEIGHT', desc: 'Outer bottom sill to outer top edge.' },
      { title: 'Measure 3 times', desc: 'Use the SMALLEST number from left/center/right and top/middle/bottom.' },
    ],
  },
  inside: {
    title: 'Measuring From Inside',
    subtitle: 'Window measurement guide',
    icon: Home,
    images: InsideImages,
    showDiagram: false,
    showWhy: false,
    buttonText: 'Got It — Continue',
    steps: [
      { title: 'Stay inside the home', desc: 'Stand inside facing the window opening.' },
      { title: 'Measure the WIDTH', desc: 'Left inner edge to right inner edge of the opening.' },
      { title: 'Measure the HEIGHT', desc: 'Inner bottom sill to inner top edge.' },
      { title: 'Measure 3 times', desc: 'Use the SMALLEST number from left/center/right and top/middle/bottom.' },
    ],
  },
};

function MeasurePopup({ type, onClose }) {
  const config = POPUP_CONFIG[type];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <Icon className="w-4 h-4 text-accent" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-primary">{config.title}</h3>
              <p className="text-[11px] text-muted">{config.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-stone-50 rounded-lg cursor-pointer transition-colors">
            <X className="w-4 h-4 text-muted" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-5 py-5 space-y-5">
          {config.showWhy && (
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
              <p className="text-xs font-semibold text-stone-800 mb-1">Why measure from outside?</p>
              <p className="text-xs text-stone-600 leading-relaxed">
                Hurricane impact doors require precise outside frame measurements to ensure a proper fit
                during installation.
              </p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-2">Photo Guide</p>
            <config.images />
          </div>

          <div>
            <p className="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-3">Instructions</p>
            <div className="space-y-3">
              {config.steps.map(({ title, desc }, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-primary">{title}</p>
                    <p className="text-[11px] text-muted leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {config.showDiagram && (
            <div className="bg-stone-50 rounded-lg p-4">
              <p className="text-[10px] font-semibold text-muted text-center mb-3 uppercase tracking-widest">Diagram</p>
              <div className="max-w-[180px] mx-auto">
                <div className="border-4 border-stone-500 rounded-md aspect-[3/4] relative bg-stone-100">
                  <div className="absolute -top-4 -left-1 -right-1 flex items-center">
                    <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-r-[5px] border-r-accent" />
                    <div className="flex-1 h-px bg-accent" />
                    <span className="px-1 text-[8px] font-bold text-accent bg-stone-50 tracking-wider">WIDTH</span>
                    <div className="flex-1 h-px bg-accent" />
                    <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[5px] border-l-accent" />
                  </div>
                  <div className="absolute -right-10 -top-1 -bottom-1 flex flex-col items-center">
                    <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-primary" />
                    <div className="flex-1 w-px bg-primary" />
                    <span className="py-0.5 text-[8px] font-bold text-primary bg-stone-50 [writing-mode:vertical-lr] tracking-wider">HEIGHT</span>
                    <div className="flex-1 w-px bg-primary" />
                    <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[5px] border-t-primary" />
                  </div>
                  <div className="flex items-center justify-center h-full">
                    <span className="text-[9px] text-muted font-medium text-center px-2">Full frame<br />border to border</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full bg-primary text-white py-3 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors cursor-pointer"
          >
            {config.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
