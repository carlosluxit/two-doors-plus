const FRACTIONS = [
  { label: '0', value: 0 },
  { label: '⅛', value: 0.125 },
  { label: '¼', value: 0.25 },
  { label: '⅜', value: 0.375 },
  { label: '½', value: 0.5 },
  { label: '⅝', value: 0.625 },
  { label: '¾', value: 0.75 },
  { label: '⅞', value: 0.875 },
];

export function nearestFraction(decimal) {
  const frac = decimal - Math.floor(decimal);
  let closest = FRACTIONS[0];
  let minDiff = Math.abs(frac - closest.value);
  for (const f of FRACTIONS) {
    const diff = Math.abs(frac - f.value);
    if (diff < minDiff) {
      minDiff = diff;
      closest = f;
    }
  }
  return closest.value;
}

export function splitInches(total) {
  if (!total || total <= 0) return { whole: 0, fraction: 0 };
  const whole = Math.floor(total);
  const fraction = nearestFraction(total);
  return { whole, fraction };
}

export function combineInches(whole, fraction) {
  return (parseInt(whole) || 0) + (fraction || 0);
}

export default function FractionPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1">
      {FRACTIONS.map((f) => (
        <button
          key={f.value}
          type="button"
          onClick={() => onChange(f.value)}
          className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer min-w-[2rem] text-center ${
            value === f.value
              ? 'bg-primary text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

export function TapeMeasureTutorial() {
  const marks = [
    { pos: 0, height: 28, label: '0', bold: true },
    { pos: 12.5, height: 10, label: '' },
    { pos: 25, height: 16, label: '¼', bold: false },
    { pos: 37.5, height: 10, label: '' },
    { pos: 50, height: 22, label: '½', bold: true },
    { pos: 62.5, height: 10, label: '' },
    { pos: 75, height: 16, label: '¾', bold: false },
    { pos: 87.5, height: 10, label: '' },
    { pos: 100, height: 28, label: '1"', bold: true },
  ];

  return (
    <div className="bg-gradient-to-b from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200/60">
      <p className="text-sm font-bold text-gray-800 text-center mb-3">
        How to Read Your Tape Measure
      </p>

      {/* Tape measure visual */}
      <div className="bg-yellow-300/80 rounded-lg px-3 pt-3 pb-1 mx-auto max-w-[280px] shadow-inner border border-yellow-400/50">
        <div className="relative h-16">
          {/* Tick marks */}
          {marks.map((m) => (
            <div
              key={m.pos}
              className="absolute bottom-0 flex flex-col items-center"
              style={{ left: `${m.pos}%`, transform: 'translateX(-50%)' }}
            >
              {m.label && (
                <span
                  className={`text-[10px] leading-none mb-0.5 ${
                    m.bold ? 'font-extrabold text-gray-900' : 'font-bold text-gray-700'
                  }`}
                >
                  {m.label}
                </span>
              )}
              <div
                className={`w-0.5 ${m.bold ? 'bg-gray-900' : 'bg-gray-700'} rounded-full`}
                style={{ height: `${m.height}px` }}
              />
            </div>
          ))}
          {/* Base line */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
        </div>

        {/* Inch label */}
        <p className="text-[9px] text-gray-700 text-center mt-1 font-semibold">ONE INCH</p>
      </div>

      {/* Quick reference */}
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">1</span>
          <span className="text-gray-700"><strong className="text-gray-900">Longest</strong> lines = whole inches</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">2</span>
          <span className="text-gray-700"><strong className="text-gray-900">½"</strong> = next longest mark</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">3</span>
          <span className="text-gray-700"><strong className="text-gray-900">¼" & ¾"</strong> = medium marks</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">4</span>
          <span className="text-gray-700"><strong className="text-gray-900">⅛"</strong> = smallest marks</span>
        </div>
      </div>

      <p className="text-[11px] text-gray-500 text-center mt-2.5 italic">
        Count the marks between whole inches. Pick the nearest fraction below!
      </p>
    </div>
  );
}
