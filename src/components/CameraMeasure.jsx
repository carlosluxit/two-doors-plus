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

const FRAC_LABELS = { 0: '', 0.125: '\u215B', 0.25: '\u00BC', 0.375: '\u215C', 0.5: '\u00BD', 0.625: '\u215D', 0.75: '\u00BE', 0.875: '\u215E' };

export default function CameraMeasure({ onComplete, onCancel, itemType, measureFrom = 'inside' }) {
  const webcamRef = useRef(null);
  const [step, setStep] = useState('guide');
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
    const w = parseInt(whole) || 0;
    const f = FRAC_LABELS[frac] || '';
    if (w === 0 && !f) return '\u2014';
    if (!f) return `${w}"`;
    return `${w} ${f}"`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <Ruler className="w-4 h-4 text-accent" strokeWidth={1.5} />
            <div>
              <h3 className="text-sm font-semibold text-primary">Measure Your {itemType === 'window' ? 'Window' : 'Door'}</h3>
              <span className="text-[10px] font-medium text-muted uppercase tracking-wide">
                {isInside ? 'Inside' : 'Outside'} Measurement
              </span>
            </div>
          </div>
          <button onClick={onCancel} className="p-1.5 hover:bg-stone-50 rounded-lg cursor-pointer transition-colors">
            <X className="w-4 h-4 text-muted" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {/* Guide */}
          {step === 'guide' && (
            <div className="p-4 space-y-4">
              <p className="text-xs text-muted text-center">
                {isInside
                  ? 'Measure from inside — wall to wall and sill to top.'
                  : 'Measure from outside — border to border where the frame sits.'}
              </p>

              {isInside ? (
                <div className="space-y-2">
                  <img src="/inside_1.GIF" alt="Measure wall to wall" className="w-full rounded-lg" />
                  <img src="/inside2.GIF" alt="Measure sill to top" className="w-full rounded-lg" />
                </div>
              ) : (
                <div className="space-y-2">
                  <img src="/outside_1.GIF" alt="Measure edge to edge" className="w-full rounded-lg" />
                  <img src="/outside_2.GIF" alt="Measure sill to top" className="w-full rounded-lg" />
                </div>
              )}

              <div className="space-y-2">
                <Tip icon={ArrowLeftRight} text={`WIDTH: ${isInside ? 'Wall to wall' : 'Border to border'} measurement`} />
                <Tip icon={ArrowUpDown} text={`HEIGHT: ${isInside ? 'Sill to top of opening' : 'Full frame height'}`} />
                <Tip icon={Ruler} text="Measure in 3 spots — use the SMALLEST number" />
              </div>

              <TapeMeasureTutorial />

              <button
                onClick={() => setStep('camera')}
                className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" strokeWidth={1.5} /> Take Photo of {label}
              </button>
              <button
                onClick={() => setStep('enter')}
                className="w-full text-center text-xs text-muted hover:text-primary cursor-pointer py-1"
              >
                Skip photo — just enter measurements
              </button>
            </div>
          )}

          {/* Camera */}
          {step === 'camera' && (
            <div className="p-4">
              {cameraError ? (
                <div className="text-center py-12">
                  <Camera className="w-8 h-8 text-stone-300 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-sm text-muted">Camera not available.</p>
                  <button
                    onClick={() => setStep('enter')}
                    className="mt-4 text-accent text-xs font-medium hover:underline cursor-pointer"
                  >
                    Enter measurements manually
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative rounded-lg overflow-hidden">
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
                      <div className="absolute inset-[15%] border border-white/40 border-dashed rounded-md" />
                      <div className="absolute bottom-3 left-0 right-0 text-center">
                        <span className="bg-black/50 text-white text-[11px] px-3 py-1 rounded-full">
                          Align {label} {isInside ? 'opening' : 'frame'} inside the guide
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={capturePhoto}
                    className="w-full mt-3 bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" strokeWidth={1.5} /> Snap Photo
                  </button>
                </>
              )}
            </div>
          )}

          {/* Enter measurements */}
          {step === 'enter' && (
            <div className="p-4 space-y-3">
              {photo && (
                <div className="relative rounded-lg overflow-hidden bg-stone-50">
                  <img src={photo} alt="Captured" className="w-full max-h-[35vh] object-contain rounded-lg" />
                  <button
                    onClick={() => { setPhoto(null); setStep('camera'); }}
                    className="absolute top-2 right-2 bg-black/40 text-white p-1 rounded-md hover:bg-black/60 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-success/80 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                    Photo saved
                  </div>
                </div>
              )}

              <p className="text-xs text-muted text-center font-medium">
                Enter your {isInside ? 'inside' : 'outside'} measurements
              </p>

              {/* Width */}
              <div className="bg-stone-50 rounded-md p-3 space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-medium text-muted uppercase tracking-wide">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                  Width {isInside ? '(wall to wall)' : '(border to border)'}
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
                    className="w-20 border border-border rounded-md px-2.5 py-2 text-sm font-medium focus:border-accent outline-none text-center bg-white"
                  />
                  <span className="text-[11px] text-muted">in +</span>
                </div>
                <FractionPicker value={widthFrac} onChange={setWidthFrac} />
                {totalWidth > 0 && (
                  <p className="text-[11px] text-primary font-semibold">
                    Total: {formatMeasurement(widthWhole, widthFrac)}
                  </p>
                )}
              </div>

              {/* Height */}
              <div className="bg-stone-50 rounded-md p-3 space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-medium text-muted uppercase tracking-wide">
                  <ArrowUpDown className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                  Height {isInside ? '(sill to top)' : '(border to border)'}
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
                    className="w-20 border border-border rounded-md px-2.5 py-2 text-sm font-medium focus:border-accent outline-none text-center bg-white"
                  />
                  <span className="text-[11px] text-muted">in +</span>
                </div>
                <FractionPicker value={heightFrac} onChange={setHeightFrac} />
                {totalHeight > 0 && (
                  <p className="text-[11px] text-primary font-semibold">
                    Total: {formatMeasurement(heightWhole, heightFrac)}
                  </p>
                )}
              </div>

              <button
                disabled={!canSubmit}
                onClick={() => onComplete({ width: totalWidth, height: totalHeight, photo })}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  canSubmit
                    ? 'bg-primary text-white hover:bg-primary-light'
                    : 'bg-stone-100 text-stone-300 cursor-not-allowed'
                }`}
              >
                Save Measurements <ChevronRight className="w-4 h-4" strokeWidth={2} />
              </button>

              {!photo && (
                <button
                  onClick={() => setStep('camera')}
                  className="w-full text-center text-xs text-muted hover:text-primary cursor-pointer py-1"
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

function Tip({ icon: Icon, text }) {
  return (
    <div className="flex items-start gap-2.5 text-xs">
      <Icon className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" strokeWidth={1.5} />
      <span className="text-stone-600">{text}</span>
    </div>
  );
}
