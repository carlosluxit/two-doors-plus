const FRACTIONS = [
  { label: '0', value: 0 },
  { label: '\u215B', value: 0.125 },
  { label: '\u00BC', value: 0.25 },
  { label: '\u215C', value: 0.375 },
  { label: '\u00BD', value: 0.5 },
  { label: '\u215D', value: 0.625 },
  { label: '\u00BE', value: 0.75 },
  { label: '\u215E', value: 0.875 },
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
          className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer min-w-[1.75rem] text-center ${
            value === f.value
              ? 'bg-primary text-white'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
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
    { pos: 0, height: 24, label: '0', bold: true },
    { pos: 12.5, height: 8, label: '' },
    { pos: 25, height: 14, label: '\u00BC', bold: false },
    { pos: 37.5, height: 8, label: '' },
    { pos: 50, height: 20, label: '\u00BD', bold: true },
    { pos: 62.5, height: 8, label: '' },
    { pos: 75, height: 14, label: '\u00BE', bold: false },
    { pos: 87.5, height: 8, label: '' },
    { pos: 100, height: 24, label: '1"', bold: true },
  ];

  return (
    <div className="bg-slate-50 rounded-lg p-4 border border-border">
      <p className="text-xs font-semibold text-primary text-center mb-3">
        How to Read Your Tape Measure
      </p>

      <div className="bg-accent/20 rounded-md px-3 pt-3 pb-1 mx-auto max-w-[260px] border border-accent/30">
        <div className="relative h-14">
          {marks.map((m) => (
            <div
              key={m.pos}
              className="absolute bottom-0 flex flex-col items-center"
              style={{ left: `${m.pos}%`, transform: 'translateX(-50%)' }}
            >
              {m.label && (
                <span className={`text-[9px] leading-none mb-0.5 ${m.bold ? 'font-bold text-primary' : 'font-medium text-slate-600'}`}>
                  {m.label}
                </span>
              )}
              <div
                className={`w-px ${m.bold ? 'bg-primary' : 'bg-slate-500'}`}
                style={{ height: `${m.height}px` }}
              />
            </div>
          ))}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-primary" />
        </div>
        <p className="text-[8px] text-slate-500 text-center mt-1 font-medium tracking-widest uppercase">One Inch</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
        {[
          { n: '1', text: 'Longest lines = whole inches' },
          { n: '2', text: '\u00BD" = next longest mark' },
          { n: '3', text: '\u00BC" & \u00BE" = medium marks' },
          { n: '4', text: '\u215B" = smallest marks' },
        ].map(({ n, text }) => (
          <div key={n} className="flex items-center gap-1.5">
            <span className="w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center text-[9px] font-semibold flex-shrink-0">{n}</span>
            <span className="text-slate-600">{text}</span>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted text-center mt-2">
        Count the marks between whole inches, then pick the nearest fraction.
      </p>
    </div>
  );
}
