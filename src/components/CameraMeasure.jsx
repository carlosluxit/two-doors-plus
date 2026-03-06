import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import {
  X,
  Camera,
  RotateCcw,
  CreditCard,
  Move,
  Check,
  ChevronRight,
  Info,
  ZoomIn,
} from 'lucide-react';

// Standard credit card dimensions in inches
const CARD_WIDTH_INCHES = 3.375;
const CARD_HEIGHT_INCHES = 2.125;

const STEPS = [
  {
    id: 'capture',
    title: 'Take Photo',
    desc: 'Hold a credit card flat against the window/door frame and take a photo.',
    icon: Camera,
  },
  {
    id: 'card',
    title: 'Mark Credit Card',
    desc: 'Tap the 4 corners of the credit card in order: top-left, top-right, bottom-right, bottom-left.',
    icon: CreditCard,
  },
  {
    id: 'frame',
    title: 'Mark Frame',
    desc: 'Tap the 4 corners of the window/door opening: top-left, top-right, bottom-right, bottom-left.',
    icon: Move,
  },
  {
    id: 'result',
    title: 'Measurements',
    desc: 'Review your calculated dimensions.',
    icon: Check,
  },
];

export default function CameraMeasure({ onComplete, onCancel, itemType }) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [step, setStep] = useState(0); // 0=capture, 1=card corners, 2=frame corners, 3=result
  const [photo, setPhoto] = useState(null);
  const [cardPoints, setCardPoints] = useState([]);
  const [framePoints, setFramePoints] = useState([]);
  const [dimensions, setDimensions] = useState(null);
  const [cameraError, setCameraError] = useState(false);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot({ width: 1280, height: 960 });
      setPhoto(imageSrc);
      setStep(1);
    }
  }, []);

  const handleImageLoad = (e) => {
    setImgSize({ w: e.target.clientWidth, h: e.target.clientHeight });
  };

  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const point = { x, y };

    if (step === 1) {
      // Marking credit card corners
      const newPoints = [...cardPoints, point];
      setCardPoints(newPoints);
      if (newPoints.length === 4) {
        setStep(2);
      }
    } else if (step === 2) {
      // Marking frame corners
      const newPoints = [...framePoints, point];
      setFramePoints(newPoints);
      if (newPoints.length === 4) {
        calculateDimensions(cardPoints, newPoints);
        setStep(3);
      }
    }
  };

  const calculateDimensions = (card, frame) => {
    // Calculate pixel distances for card
    const cardPixelWidth = dist(card[0], card[1]);
    const cardPixelHeight = dist(card[1], card[2]);

    // Pixels per inch based on card reference
    const ppiHorizontal = cardPixelWidth / CARD_WIDTH_INCHES;
    const ppiVertical = cardPixelHeight / CARD_HEIGHT_INCHES;
    const ppi = (ppiHorizontal + ppiVertical) / 2;

    // Calculate frame pixel dimensions
    const framePixelWidth = (dist(frame[0], frame[1]) + dist(frame[3], frame[2])) / 2;
    const framePixelHeight = (dist(frame[0], frame[3]) + dist(frame[1], frame[2])) / 2;

    // Convert to inches
    const widthInches = Math.round(framePixelWidth / ppi);
    const heightInches = Math.round(framePixelHeight / ppi);

    setDimensions({ width: widthInches, height: heightInches });
  };

  const dist = (a, b) => Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);

  const resetStep = (targetStep) => {
    if (targetStep <= 1) setCardPoints([]);
    if (targetStep <= 2) setFramePoints([]);
    if (targetStep === 0) setPhoto(null);
    setDimensions(null);
    setStep(targetStep);
  };

  const currentStep = STEPS[step];
  const activePoints = step === 1 ? cardPoints : framePoints;
  const cornerLabels = ['TL', 'TR', 'BR', 'BL'];

  // Draw overlay on canvas
  useEffect(() => {
    if (!canvasRef.current || !photo || step === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = imgSize.w;
    canvas.height = imgSize.h;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawPolygon = (points, color, label) => {
      if (points.length === 0) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.fillStyle = color + '20';

      if (points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        if (points.length === 4) {
          ctx.closePath();
          ctx.fill();
        }
        ctx.stroke();
      }

      // Draw points
      points.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cornerLabels[i], p.x, p.y);
      });

      // Draw dimension labels for completed shapes
      if (points.length === 4) {
        const midTop = midpoint(points[0], points[1]);
        const midRight = midpoint(points[1], points[2]);

        if (label === 'card') {
          drawLabel(ctx, midTop, `${CARD_WIDTH_INCHES}"`, color);
          drawLabel(ctx, midRight, `${CARD_HEIGHT_INCHES}"`, color);
        } else if (dimensions) {
          drawLabel(ctx, midTop, `${dimensions.width}"`, color);
          drawLabel(ctx, midRight, `${dimensions.height}"`, color);
        }
      }
    };

    drawPolygon(cardPoints, '#f59e0b', 'card');
    drawPolygon(framePoints, '#3b82f6', 'frame');
  }, [cardPoints, framePoints, imgSize, step, dimensions]);

  const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

  const drawLabel = (ctx, pos, text, color) => {
    ctx.font = 'bold 14px sans-serif';
    const metrics = ctx.measureText(text);
    const pad = 4;
    ctx.fillStyle = color;
    ctx.fillRect(pos.x - metrics.width / 2 - pad, pos.y - 10, metrics.width + pad * 2, 20);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, pos.x, pos.y);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
              {step + 1}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{currentStep.title}</h3>
              <p className="text-xs text-gray-500">{currentStep.desc}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 py-2 bg-gray-50">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step ? 'w-6 bg-primary' : i < step ? 'bg-success' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {step === 0 && (
            <div className="p-4">
              {/* Instructions */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">How to get accurate measurements:</p>
                    <ol className="mt-1 text-amber-700 space-y-1 list-decimal ml-4">
                      <li>Hold a credit card flat against the window/door frame</li>
                      <li>Stand back so the full frame is visible</li>
                      <li>Keep the camera straight (not angled)</li>
                      <li>Make sure the card and frame are in the same plane</li>
                    </ol>
                  </div>
                </div>
              </div>

              {cameraError ? (
                <div className="text-center py-12">
                  <Camera className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Camera not available.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Please allow camera access or use a device with a camera.
                  </p>
                </div>
              ) : (
                <>
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    screenshotQuality={0.9}
                    className="w-full rounded-xl"
                    videoConstraints={{ facingMode: 'environment', width: 1280, height: 960 }}
                    onUserMediaError={() => setCameraError(true)}
                  />
                  <button
                    onClick={capturePhoto}
                    className="w-full mt-4 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-light transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    Capture Photo
                  </button>
                </>
              )}
            </div>
          )}

          {(step === 1 || step === 2 || step === 3) && photo && (
            <div className="p-4">
              {/* Indicator for what to tap */}
              {(step === 1 || step === 2) && (
                <div
                  className={`rounded-lg px-3 py-2 mb-3 text-sm font-medium flex items-center gap-2 ${
                    step === 1
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-blue-50 text-blue-800 border border-blue-200'
                  }`}
                >
                  <ZoomIn className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Tap corner{' '}
                    <strong>
                      {cornerLabels[activePoints.length]} ({activePoints.length + 1}/4)
                    </strong>
                    {step === 1 ? ' of the credit card' : ` of the ${itemType} frame`}
                  </span>
                </div>
              )}

              {/* Image with overlay */}
              <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                <img
                  ref={imgRef}
                  src={photo}
                  alt="Captured"
                  className="w-full"
                  onClick={step < 3 ? handleImageClick : undefined}
                  onLoad={handleImageLoad}
                  style={{ cursor: step < 3 ? 'crosshair' : 'default' }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                />
                {/* Legend */}
                <div className="absolute bottom-2 left-2 flex gap-2">
                  {cardPoints.length > 0 && (
                    <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                      Card
                    </span>
                  )}
                  {framePoints.length > 0 && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                      Frame
                    </span>
                  )}
                </div>
              </div>

              {/* Undo last point */}
              {step < 3 && activePoints.length > 0 && (
                <button
                  onClick={() => {
                    if (step === 1) setCardPoints(cardPoints.slice(0, -1));
                    else setFramePoints(framePoints.slice(0, -1));
                  }}
                  className="mt-3 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Undo last point
                </button>
              )}

              {/* Results */}
              {step === 3 && dimensions && (
                <div className="mt-4 space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                      <Check className="w-5 h-5" /> Calculated Dimensions
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-3 text-center border border-green-100">
                        <div className="text-3xl font-extrabold text-gray-900">
                          {dimensions.width}"
                        </div>
                        <div className="text-sm text-gray-500">Width</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center border border-green-100">
                        <div className="text-3xl font-extrabold text-gray-900">
                          {dimensions.height}"
                        </div>
                        <div className="text-sm text-gray-500">Height</div>
                      </div>
                    </div>
                    <p className="text-xs text-green-700 mt-3">
                      Based on credit card reference ({CARD_WIDTH_INCHES}" x {CARD_HEIGHT_INCHES}").
                      Accuracy depends on camera angle and card placement.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => resetStep(0)}
                      className="flex-1 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      Retake
                    </button>
                    <button
                      onClick={() =>
                        onComplete({
                          width: dimensions.width,
                          height: dimensions.height,
                          photo,
                        })
                      }
                      className="flex-1 py-3 rounded-xl font-semibold text-white bg-primary hover:bg-primary-light transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      Use Measurements <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
