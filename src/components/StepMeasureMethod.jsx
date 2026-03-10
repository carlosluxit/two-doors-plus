import { useState, useEffect } from 'react';
import { useQuote, useQuoteDispatch } from '../context/QuoteContext';
import { ArrowRight, ArrowLeft, Home, Square, X, AlertTriangle, Play } from 'lucide-react';

export default function StepMeasureMethod() {
  const state = useQuote();
  const dispatch = useQuoteDispatch();
  const hasDoors = state.projectType === 'doors' || state.projectType === 'both';

  // Auto-set outside for doors and show popup
  const [showPopup, setShowPopup] = useState(false);
  const [understood, setUnderstood] = useState(false);

  useEffect(() => {
    if (hasDoors) {
      dispatch({ type: 'SET_MEASURE_FROM', measureFrom: 'outside' });
      setShowPopup(true);
    }
  }, [hasDoors]);

  const selected = state.measureFrom;

  const canContinue = !hasDoors || understood;

  return (
    <div className="max-w-xl mx-auto px-4 py-10 animate-fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
        How Will You Measure?
      </h2>
      <p className="text-gray-500 text-center mb-8">
        Select where you'll be taking measurements from.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Inside card */}
        <button
          type="button"
          disabled={hasDoors}
          onClick={() => dispatch({ type: 'SET_MEASURE_FROM', measureFrom: 'inside' })}
          className={`relative rounded-2xl border-2 p-5 text-left transition-all cursor-pointer ${
            selected === 'inside' && !hasDoors
              ? 'border-primary bg-blue-50 shadow-md'
              : hasDoors
              ? 'border-gray-200 bg-gray-50 opacity-40 cursor-not-allowed'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
            selected === 'inside' && !hasDoors ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
          }`}>
            <Home className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">From Inside</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Wall to wall, sill to top of the opening — measured from inside the home.
          </p>
          {selected === 'inside' && !hasDoors && (
            <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          )}
        </button>

        {/* Outside card */}
        <button
          type="button"
          onClick={() => {
            dispatch({ type: 'SET_MEASURE_FROM', measureFrom: 'outside' });
            if (hasDoors) setShowPopup(true);
          }}
          className={`relative rounded-2xl border-2 p-5 text-left transition-all cursor-pointer ${
            selected === 'outside'
              ? 'border-amber-500 bg-amber-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
            selected === 'outside' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400'
          }`}>
            <Square className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">From Outside</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Border to border — full frame width and height measured from outside the home.
          </p>
          {selected === 'outside' && (
            <div className="absolute top-3 right-3 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          )}
          {hasDoors && (
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
              Required for doors
            </span>
          )}
        </button>
      </div>

      {/* Notice for door projects */}
      {hasDoors && !understood && (
        <button
          onClick={() => setShowPopup(true)}
          className="w-full flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 cursor-pointer hover:bg-amber-100 transition-colors"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span className="text-sm text-amber-800 font-medium text-left">
            Doors must be measured from outside — tap to see how
          </span>
          <Play className="w-4 h-4 text-amber-600 ml-auto flex-shrink-0" />
        </button>
      )}

      {hasDoors && understood && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <span className="text-sm text-green-800 font-medium">Got it — you'll measure from outside</span>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => dispatch({ type: 'PREV_STEP' })}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <button
          disabled={!canContinue}
          onClick={() => dispatch({ type: 'NEXT_STEP' })}
          className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-lg transition-all cursor-pointer ${
            canContinue
              ? 'bg-primary text-white hover:bg-primary-light'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Outside measurement popup */}
      {showPopup && (
        <OutsideMeasurePopup
          onClose={() => {
            setShowPopup(false);
            setUnderstood(true);
          }}
        />
      )}
    </div>
  );
}

function OutsideMeasurePopup({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Measuring From Outside</h3>
              <p className="text-xs text-gray-500">Required for all door measurements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-5">
          {/* Why outside */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-amber-900 mb-1">Why measure from outside?</p>
            <p className="text-sm text-amber-800">
              Hurricane impact doors require precise outside frame measurements to ensure a proper fit
              during installation. Inside measurements do not account for the full frame dimensions
              needed to select the correct door unit.
            </p>
          </div>

          {/* Video/GIF placeholder */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Play className="w-4 h-4 text-primary" /> How to Measure (Video Guide)
            </p>
            <div className="bg-gray-900 rounded-xl aspect-video flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center">
                <Play className="w-7 h-7 text-white ml-1" />
              </div>
              <p className="text-white/60 text-sm text-center px-4">
                Measurement video guide coming soon
              </p>
            </div>
          </div>

          {/* Step-by-step instructions */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">Step-by-Step Instructions</p>
            <div className="space-y-3">
              {[
                {
                  step: '1',
                  title: 'Go outside the home',
                  desc: 'Stand outside where you can see the full door frame.',
                  color: 'bg-amber-500',
                },
                {
                  step: '2',
                  title: 'Measure the WIDTH',
                  desc: 'Measure across the widest point of the door frame — from the outer edge of the left brick-mold to the outer edge of the right brick-mold.',
                  color: 'bg-accent',
                },
                {
                  step: '3',
                  title: 'Measure the HEIGHT',
                  desc: 'Measure from the threshold (bottom sill) at the floor level up to the top outer edge of the frame.',
                  color: 'bg-blue-500',
                },
                {
                  step: '4',
                  title: 'Measure 3 times',
                  desc: 'Take measurements at left, center, and right for width; and top, middle, and bottom for height. Use the SMALLEST number.',
                  color: 'bg-green-500',
                },
              ].map(({ step, title, desc, color }) => (
                <div key={step} className="flex gap-3">
                  <div className={`w-6 h-6 ${color} text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5`}>
                    {step}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diagram */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-600 text-center mb-3 uppercase tracking-wide">Outside Measurement Diagram</p>
            <div className="max-w-[200px] mx-auto">
              <div className="border-[6px] border-stone-600 rounded-lg aspect-[3/4] relative bg-sky-100">
                {/* Width arrow */}
                <div className="absolute -top-5 -left-2 -right-2 flex items-center">
                  <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[6px] border-r-accent" />
                  <div className="flex-1 h-0.5 bg-accent" />
                  <span className="px-1 text-[9px] font-bold text-accent bg-gray-50 whitespace-nowrap">WIDTH</span>
                  <div className="flex-1 h-0.5 bg-accent" />
                  <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-accent" />
                </div>
                {/* Height arrow */}
                <div className="absolute -right-12 -top-2 -bottom-2 flex flex-col items-center">
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-blue-500" />
                  <div className="flex-1 w-0.5 bg-blue-500" />
                  <span className="py-0.5 text-[9px] font-bold text-blue-500 bg-gray-50 [writing-mode:vertical-lr]">HEIGHT</span>
                  <div className="flex-1 w-0.5 bg-blue-500" />
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-blue-500" />
                </div>
                {/* Corner markers */}
                {['-top-1 -left-1', '-top-1 -right-1', '-bottom-1 -left-1', '-bottom-1 -right-1'].map((pos, i) => (
                  <div key={i} className={`absolute ${pos} w-2.5 h-2.5 bg-amber-500 rounded-full`} />
                ))}
                <div className="flex items-center justify-center h-full">
                  <span className="text-[10px] text-stone-500 font-semibold text-center px-2">Full frame<br />border to border</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-base hover:bg-primary-light transition-colors cursor-pointer"
          >
            I Understand — I'll Measure From Outside
          </button>
        </div>
      </div>
    </div>
  );
}
