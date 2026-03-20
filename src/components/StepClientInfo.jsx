import { useQuote, useQuoteDispatch } from '../context/QuoteContext';
import { ArrowRight, ArrowLeft, Lock, User, Mail, Phone, MapPin } from 'lucide-react';

export default function StepClientInfo() {
  const state = useQuote();
  const dispatch = useQuoteDispatch();
  const { clientInfo } = state;

  const update = (field, value) => {
    dispatch({ type: 'SET_CLIENT_INFO', info: { [field]: value } });
  };

  const canProceed =
    clientInfo.firstName.trim() &&
    clientInfo.lastName.trim() &&
    clientInfo.email.trim() &&
    clientInfo.phone.trim() &&
    clientInfo.address.trim() &&
    clientInfo.city.trim() &&
    clientInfo.zip.trim();

  return (
    <div className="max-w-md mx-auto px-5 py-14 animate-fade-in">
      <h2 className="text-xl font-semibold text-primary text-center mb-1.5">
        Your Information
      </h2>
      <p className="text-sm text-muted text-center mb-3">
        We need your details to generate your guaranteed quote.
      </p>
      <div className="flex items-center justify-center gap-2 mb-10 text-[11px] text-success">
        <Lock className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
        <span>Your information is never sold to third parties.</span>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <InputField icon={User} label="First Name" value={clientInfo.firstName} onChange={(v) => update('firstName', v)} placeholder="John" />
          <InputField icon={User} label="Last Name" value={clientInfo.lastName} onChange={(v) => update('lastName', v)} placeholder="Smith" />
        </div>
        <InputField icon={Mail} label="Email" type="email" value={clientInfo.email} onChange={(v) => update('email', v)} placeholder="john@example.com" />
        <InputField icon={Phone} label="Phone" type="tel" value={clientInfo.phone} onChange={(v) => update('phone', v)} placeholder="(786) 555-1234" />
        <InputField icon={MapPin} label="Property Address" value={clientInfo.address} onChange={(v) => update('address', v)} placeholder="123 Ocean Drive" />
        <div className="grid grid-cols-2 gap-3">
          <InputField icon={MapPin} label="City" value={clientInfo.city} onChange={(v) => update('city', v)} placeholder="Miami" />
          <InputField label="ZIP" value={clientInfo.zip} onChange={(v) => update('zip', v)} placeholder="33139" maxLength={5} />
        </div>
      </div>

      <div className="flex items-center justify-between mt-10">
        <button
          onClick={() => dispatch({ type: 'PREV_STEP' })}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-muted hover:text-primary hover:bg-stone-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Back
        </button>
        <button
          disabled={!canProceed}
          onClick={() => dispatch({ type: 'NEXT_STEP' })}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium tracking-wide transition-all cursor-pointer ${
            canProceed
              ? 'bg-primary text-white hover:bg-primary-light'
              : 'bg-stone-100 text-stone-300 cursor-not-allowed'
          }`}
        >
          Continue <ArrowRight className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function InputField({ icon: Icon, label, type = 'text', value, onChange, placeholder, maxLength }) {
  return (
    <div>
      <label className="text-[10px] text-muted uppercase tracking-wide block mb-1.5">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" strokeWidth={1.5} />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full border border-border rounded-md py-2.5 text-sm focus:border-accent outline-none transition-colors placeholder:text-stone-300 ${
            Icon ? 'pl-9 pr-3' : 'px-3'
          }`}
        />
      </div>
    </div>
  );
}
