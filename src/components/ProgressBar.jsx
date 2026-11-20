import { Check } from 'lucide-react';

const STEPS = [
  'Project',
  'Method',
  'Option',
  'Measure',
  'Details',
  'Verify',
  'Quote',
];

export default function ProgressBar({ currentStep }) {
  if (currentStep < 1 || currentStep > STEPS.length) return null;

  return (
    <div className="bg-white border-b border-border py-3 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between">
          {STEPS.map((label, i) => {
            const stepNum = i + 1;
            const isComplete = currentStep > stepNum;
            const isCurrent = currentStep === stepNum;
            return (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      isComplete
                        ? 'bg-primary text-white'
                        : isCurrent
                        ? 'bg-accent text-white'
                        : 'bg-slate-100 text-muted'
                    }`}
                  >
                    {isComplete ? <Check className="w-3.5 h-3.5" strokeWidth={2} /> : stepNum}
                  </div>
                  <span
                    className={`text-[9px] mt-1.5 tracking-wide uppercase hidden sm:block ${
                      isCurrent ? 'text-accent font-semibold' : isComplete ? 'text-primary' : 'text-muted'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-3 sm:w-8 lg:w-11 h-px mx-1 sm:mx-1.5 ${
                      currentStep > stepNum ? 'bg-primary' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
