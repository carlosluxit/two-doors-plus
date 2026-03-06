import { Check } from 'lucide-react';

const STEPS = [
  'Project Type',
  'Measurements',
  'Select Tier',
  'Your Info',
  'Verify',
  'Your Quote',
];

export default function ProgressBar({ currentStep }) {
  if (currentStep < 1 || currentStep > 6) return null;

  return (
    <div className="bg-white border-b border-gray-200 py-4 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          {STEPS.map((label, i) => {
            const stepNum = i + 1;
            const isComplete = currentStep > stepNum;
            const isCurrent = currentStep === stepNum;
            return (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      isComplete
                        ? 'bg-success text-white'
                        : isCurrent
                        ? 'bg-primary text-white ring-4 ring-blue-100'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isComplete ? <Check className="w-4 h-4" /> : stepNum}
                  </div>
                  <span
                    className={`text-[10px] mt-1 hidden sm:block ${
                      isCurrent ? 'text-primary font-semibold' : 'text-gray-400'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-6 sm:w-12 lg:w-20 h-0.5 mx-1 ${
                      currentStep > stepNum ? 'bg-success' : 'bg-gray-200'
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
