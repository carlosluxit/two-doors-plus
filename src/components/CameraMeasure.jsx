import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import {
  X,
  Camera,
  RotateCcw,
  ChevronRight,
  Ruler,
  ArrowLeftRight,
  ArrowUpDown,
} from 'lucide-react';
import FractionPicker, { TapeMeasureTutorial, combineInches } from './FractionPicker';

export default function CameraMeasure({ onComplete, onCancel, itemType, measureFrom = 'inside' }) {
  const webcamRef = useRef(null);
  const [step, setStep] = useState('guide'); // 'guide' | 'camera' | 'enter'
  const [photo, setPhoto] = useState(null);
  const [widthWhole, setWidthWhole] = useState('');
  const [widthFrac, setWidthFrac] = useState(0);
  const [heightWhole, setHeightWhole] = useState('');
  const [heightFrac, setHeightFrac] = useState(0);
  const [cameraError, setCameraError] = useState(false);

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot({ width: 1280, height: 960 });
      setPhoto(imageSrc);
      setStep('enter');
    }
  }, []);

  const totalWidth = combineInches(widthWhole, widthFrac);
  const totalHeight = combineInches(heightWhole, heightFrac);
  const canSubmit = totalWidth > 0 && totalHeight > 0;
  const label = itemType === 'window' ? 'window' : 'door';
  const isInside = measureFrom === 'inside';

  const formatMeasurement = (whole, frac) => {
    const fractionLabels = { 0: '', 0.125: '⅛', 0.25: '¼', 0.375: '⅜', 0.5: '½', 0.625: '⅝', 0.75: '¾', 0.875: '⅞' };
    const w = parseInt(whole) || 0;
    const f = fractionLabels[frac] || '';
    if (w === 0 && !f) return '—';
    if (!f) return `${w}"`;
    return `${w} ${f}"`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Ruler className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-bold text-gray-900">Measure Your {itemType === 'window' ? 'Window' : 'Door'}</h3>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isInside ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {isInside ? 'Inside' : 'Outside'} Measurement
              </span>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {/* STEP 1: Visual Guide */}
          {step === 'guide' && (
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600 text-center">
                {isInside
                  ? `Measure from inside the house — wall to wall and sill to top.`
                  : `Measure from outside — border to border where the frame sits.`}
              </p>

              {/* Visual diagram — Inside vs Outside */}
              {isInside ? (
                <InsideDiagram label={label} />
              ) : (
                <OutsideDiagram label={label} />
              )}

              {/* Tips */}
              <div className="space-y-2">
                {isInside ? (
                  <>
                    <Tip icon={ArrowLeftRight} color="text-accent" text="WIDTH: Wall to wall — measure the opening from left wall to right wall" />
                    <Tip icon={ArrowUpDown} color="text-blue-500" text="HEIGHT: Sill to top — measure from the window sill up to the top of the opening" />
                    <Tip icon={Ruler} color="text-gray-500" text="Measure in 3 spots — use the SMALLEST number" />
                  </>
                ) : (
                  <>
                    <Tip icon={ArrowLeftRight} color="text-accent" text="WIDTH: Border to border — measure the full outside frame width" />
                    <Tip icon={ArrowUpDown} color="text-blue-500" text="HEIGHT: Border to border — measure the full outside frame height" />
                    <Tip icon={Ruler} color="text-gray-500" text="Include the entire frame edge in your measurement" />
                  </>
                )}
              </div>

              {/* Tape Measure Tutorial */}
              <TapeMeasureTutorial />

              <button
                onClick={() => setStep('camera')}
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-light transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" /> Take Photo of {label}
              </button>
              <button
                onClick={() => setStep('enter')}
                className="w-full text-center text-sm text-primary hover:underline cursor-pointer py-1"
              >
                Skip photo — just enter measurements
              </button>
            </div>
          )}

          {/* STEP 2: Camera */}
          {step === 'camera' && (
            <div className="p-4">
              {cameraError ? (
                <div className="text-center py-8">
                  <Camera className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Camera not available.</p>
                  <button
                    onClick={() => setStep('enter')}
                    className="mt-4 text-primary text-sm font-medium hover:underline cursor-pointer"
                  >
                    Enter measurements manually instead
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative rounded-xl overflow-hidden">
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      screenshotQuality={0.9}
                      className="w-full"
                      videoConstraints={{ facingMode: 'environment', width: 1280, height: 960 }}
                      onUserMediaError={() => setCameraError(true)}
                    />
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-[15%] border-2 border-white/60 border-dashed rounded-lg" />
                      <div className="absolute bottom-3 left-0 right-0 text-center">
                        <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
                          Align {label} {isInside ? 'opening' : 'frame'} inside the guide
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={capturePhoto}
                    className="w-full mt-4 bg-primary text-white py-3.5 rounded-xl font-semibold hover:bg-primary-light transition-colors cursor-pointer flex items-center justify-center gap-2 text-lg"
                  >
                    <Camera className="w-5 h-5" /> Snap Photo
                  </button>
                </>
              )}
            </div>
          )}

          {/* STEP 3: Enter measurements with fraction picker */}
          {step === 'enter' && (
            <div className="p-4 space-y-4">
              {photo && (
                <div className="relative rounded-xl overflow-hidden bg-gray-100">
                  <img src={photo} alt="Your window/door" className="w-full max-h-[40vh] object-contain rounded-xl" />
                  <button
                    onClick={() => { setPhoto(null); setStep('camera'); }}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-success/90 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Photo saved for verification
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-600 text-center font-medium">
                Enter your {isInside ? 'inside' : 'outside'} measurements below
              </p>

              {/* Width input */}
              <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <ArrowLeftRight className="w-4 h-4 text-accent" /> Width {isInside ? '(wall to wall)' : '(border to border)'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="200"
                    value={widthWhole}
                    onChange={(e) => setWidthWhole(e.target.value)}
                    placeholder="36"
                    autoFocus
                    className="w-24 border-2 border-gray-200 rounded-xl px-3 py-2.5 text-lg font-semibold focus:border-primary outline-none transition-colors text-center bg-white"
                  />
                  <span className="text-sm text-gray-500 font-medium">inches</span>
                  <span className="text-sm text-gray-400">+</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 mb-1 block">Partial inches:</span>
                  <FractionPicker value={widthFrac} onChange={setWidthFrac} />
                </div>
                {totalWidth > 0 && (
                  <p className="text-xs text-primary font-semibold">
                    Total: {formatMeasurement(widthWhole, widthFrac)}
                  </p>
                )}
              </div>

              {/* Height input */}
              <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <ArrowUpDown className="w-4 h-4 text-blue-500" /> Height {isInside ? '(sill to top)' : '(border to border)'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="200"
                    value={heightWhole}
                    onChange={(e) => setHeightWhole(e.target.value)}
                    placeholder="48"
                    className="w-24 border-2 border-gray-200 rounded-xl px-3 py-2.5 text-lg font-semibold focus:border-primary outline-none transition-colors text-center bg-white"
                  />
                  <span className="text-sm text-gray-500 font-medium">inches</span>
                  <span className="text-sm text-gray-400">+</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 mb-1 block">Partial inches:</span>
                  <FractionPicker value={heightFrac} onChange={setHeightFrac} />
                </div>
                {totalHeight > 0 && (
                  <p className="text-xs text-primary font-semibold">
                    Total: {formatMeasurement(heightWhole, heightFrac)}
                  </p>
                )}
              </div>

              <button
                disabled={!canSubmit}
                onClick={() =>
                  onComplete({
                    width: totalWidth,
                    height: totalHeight,
                    photo,
                  })
                }
                className={`w-full py-3.5 rounded-xl font-semibold text-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  canSubmit
                    ? 'bg-primary text-white hover:bg-primary-light'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Save Measurements <ChevronRight className="w-5 h-5" />
              </button>

              {!photo && (
                <button
                  onClick={() => setStep('camera')}
                  className="w-full text-center text-sm text-primary hover:underline cursor-pointer py-1"
                >
                  Want to add a photo?
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- Helper Components ---- */

function Tip({ icon: Icon, color, text }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className={`w-4 h-4 ${color} flex-shrink-0 mt-0.5`} />
      <span className="text-gray-700">{text}</span>
    </div>
  );
}

function InsideDiagram({ label }) {
  return (
    <div className="bg-gray-50 rounded-xl p-5 relative">
      <div className="text-xs font-bold text-blue-600 text-center mb-3 uppercase tracking-wide">
        Inside Measurement
      </div>

      {/* Wall representation */}
      <div className="relative max-w-[220px] mx-auto">
        {/* Outer wall */}
        <div className="bg-stone-300 rounded-lg p-3">
          {/* Inner opening */}
          <div className="bg-sky-100 border-2 border-stone-400 rounded aspect-[3/4] relative">
            {/* Wall labels */}
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-[9px] font-bold text-stone-500 [writing-mode:vertical-lr] rotate-180">
              WALL
            </div>
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-[9px] font-bold text-stone-500 [writing-mode:vertical-lr]">
              WALL
            </div>

            {/* Width arrow inside */}
            <div className="absolute top-3 left-2 right-2 flex items-center">
              <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[6px] border-r-accent" />
              <div className="flex-1 h-0.5 bg-accent" />
              <span className="px-1.5 text-[10px] font-bold text-accent bg-sky-100">WALL TO WALL</span>
              <div className="flex-1 h-0.5 bg-accent" />
              <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-accent" />
            </div>

            {/* Height arrow */}
            <div className="absolute right-3 top-2 bottom-2 flex flex-col items-center">
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-blue-500" />
              <div className="flex-1 w-0.5 bg-blue-500" />
              <span className="py-0.5 text-[9px] font-bold text-blue-500 bg-sky-100 [writing-mode:vertical-lr]">SILL TO TOP</span>
              <div className="flex-1 w-0.5 bg-blue-500" />
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-blue-500" />
            </div>

            {/* Sill label */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-semibold text-stone-500 bg-sky-100 px-1">
              SILL
            </div>

            {/* Center label */}
            <div className="flex items-center justify-center h-full">
              <span className="text-[10px] text-stone-400 font-medium">Opening</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OutsideDiagram({ label }) {
  return (
    <div className="bg-gray-50 rounded-xl p-5 relative">
      <div className="text-xs font-bold text-amber-600 text-center mb-3 uppercase tracking-wide">
        Outside Measurement
      </div>

      <div className="relative max-w-[220px] mx-auto">
        {/* Frame with visible border */}
        <div className="border-[6px] border-stone-600 rounded-lg aspect-[3/4] relative bg-sky-100">
          {/* Frame label */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] font-bold text-stone-500 uppercase tracking-wide whitespace-nowrap">
            {label} frame
          </div>

          {/* Width arrow - outside the frame */}
          <div className="absolute -top-4 -left-1.5 -right-1.5 flex items-center">
            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[6px] border-r-accent" />
            <div className="flex-1 h-0.5 bg-accent" />
            <span className="px-1 text-[9px] font-bold text-accent bg-gray-50 whitespace-nowrap">BORDER TO BORDER</span>
            <div className="flex-1 h-0.5 bg-accent" />
            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-accent" />
          </div>

          {/* Height arrow - outside the frame */}
          <div className="absolute -right-14 -top-1.5 -bottom-1.5 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-blue-500" />
            <div className="flex-1 w-0.5 bg-blue-500" />
            <span className="py-0.5 text-[9px] font-bold text-blue-500 bg-gray-50 [writing-mode:vertical-lr] whitespace-nowrap">BORDER TO BORDER</span>
            <div className="flex-1 w-0.5 bg-blue-500" />
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-blue-500" />
          </div>

          {/* Frame edge highlight */}
          <div className="absolute inset-0 border-2 border-dashed border-stone-400/50 rounded" />

          {/* Center label */}
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <span className="text-[10px] text-stone-400 font-medium block">Measure the</span>
              <span className="text-[10px] text-stone-500 font-bold block">FULL frame</span>
            </div>
          </div>

          {/* Corner markers on frame border */}
          {['-top-1 -left-1', '-top-1 -right-1', '-bottom-1 -left-1', '-bottom-1 -right-1'].map((pos, i) => (
            <div key={i} className={`absolute ${pos} w-2.5 h-2.5 bg-amber-500 rounded-full`} />
          ))}
        </div>
      </div>
    </div>
  );
}
