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

export default function CameraMeasure({ onComplete, onCancel, itemType }) {
  const webcamRef = useRef(null);
  const [step, setStep] = useState('guide'); // 'guide' | 'camera' | 'enter'
  const [photo, setPhoto] = useState(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [cameraError, setCameraError] = useState(false);

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot({ width: 1280, height: 960 });
      setPhoto(imageSrc);
      setStep('enter');
    }
  }, []);

  const canSubmit = parseInt(width) > 0 && parseInt(height) > 0;
  const label = itemType === 'window' ? 'window' : 'door';

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Ruler className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-gray-900">Measure Your {itemType === 'window' ? 'Window' : 'Door'}</h3>
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
                Here's how to measure your {label}. Use a tape measure for best results.
              </p>

              {/* Visual diagram */}
              <div className="bg-gray-50 rounded-xl p-6 relative">
                <div className="border-4 border-primary rounded-lg aspect-[3/4] max-w-[200px] mx-auto relative">
                  {/* Frame label */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    {label} frame
                  </div>

                  {/* Width arrow - top */}
                  <div className="absolute -top-1 left-2 right-2 flex items-center justify-center">
                    <div className="flex-1 h-0.5 bg-accent" />
                    <span className="px-2 text-xs font-bold text-accent bg-gray-50">WIDTH</span>
                    <div className="flex-1 h-0.5 bg-accent" />
                  </div>

                  {/* Height arrow - right side */}
                  <div className="absolute -right-12 top-2 bottom-2 flex flex-col items-center justify-center">
                    <div className="flex-1 w-0.5 bg-blue-500" />
                    <span className="py-1 text-xs font-bold text-blue-500 bg-gray-50 [writing-mode:vertical-lr]">HEIGHT</span>
                    <div className="flex-1 w-0.5 bg-blue-500" />
                  </div>

                  {/* Inner opening */}
                  <div className="absolute inset-3 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-400 text-center px-2">
                      Measure inside edges
                    </span>
                  </div>

                  {/* Corner markers */}
                  {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
                    <div key={i} className={`absolute ${pos} w-3 h-3 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2`}
                      style={{
                        transform: `translate(${pos.includes('right') ? '50%' : '-50%'}, ${pos.includes('bottom') ? '50%' : '-50%'})`
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="space-y-2">
                {[
                  { icon: ArrowLeftRight, color: 'text-accent', text: 'WIDTH: Measure inside the frame, left edge to right edge' },
                  { icon: ArrowUpDown, color: 'text-blue-500', text: 'HEIGHT: Measure inside the frame, top to bottom' },
                  { icon: Ruler, color: 'text-gray-500', text: 'Measure in 3 spots — use the SMALLEST number' },
                ].map(({ icon: Icon, color, text }) => (
                  <div key={text} className="flex items-start gap-3 text-sm">
                    <Icon className={`w-4 h-4 ${color} flex-shrink-0 mt-0.5`} />
                    <span className="text-gray-700">{text}</span>
                  </div>
                ))}
              </div>

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
                  {/* Camera with overlay guide */}
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
                    {/* Guide overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-[15%] border-2 border-white/60 border-dashed rounded-lg" />
                      <div className="absolute bottom-3 left-0 right-0 text-center">
                        <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
                          Align {label} frame inside the guide
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

          {/* STEP 3: Enter measurements */}
          {step === 'enter' && (
            <div className="p-4 space-y-4">
              {/* Photo preview */}
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
                Enter your measurements in inches
              </p>

              {/* Width input */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  <ArrowLeftRight className="w-4 h-4 text-accent" /> Width (inches)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="10"
                  max="200"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="e.g. 36"
                  autoFocus
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-semibold focus:border-primary outline-none transition-colors text-center"
                />
              </div>

              {/* Height input */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  <ArrowUpDown className="w-4 h-4 text-blue-500" /> Height (inches)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="10"
                  max="200"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g. 48"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-semibold focus:border-primary outline-none transition-colors text-center"
                />
              </div>

              {/* Submit */}
              <button
                disabled={!canSubmit}
                onClick={() =>
                  onComplete({
                    width: parseInt(width),
                    height: parseInt(height),
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
