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
    <div className="max-w-xl mx-auto px-4 py-8 animate-fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
        Your Information
      </h2>
      <p className="text-gray-500 text-center mb-2">
        We need your details to generate your guaranteed quote.
      </p>
      <div className="flex items-center justify-center gap-2 mb-8 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
        <Lock className="w-4 h-4 flex-shrink-0" />
        <span>Your information is never sold to third parties. Privacy guaranteed.</span>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InputField
            icon={User}
            label="First Name"
            value={clientInfo.firstName}
            onChange={(v) => update('firstName', v)}
            placeholder="John"
          />
          <InputField
            icon={User}
            label="Last Name"
            value={clientInfo.lastName}
            onChange={(v) => update('lastName', v)}
            placeholder="Smith"
          />
        </div>
        <InputField
          icon={Mail}
          label="Email Address"
          type="email"
          value={clientInfo.email}
          onChange={(v) => update('email', v)}
          placeholder="john@example.com"
        />
        <InputField
          icon={Phone}
          label="Phone Number"
          type="tel"
          value={clientInfo.phone}
          onChange={(v) => update('phone', v)}
          placeholder="(786) 555-1234"
        />
        <InputField
          icon={MapPin}
          label="Property Address"
          value={clientInfo.address}
          onChange={(v) => update('address', v)}
          placeholder="123 Ocean Drive"
        />
        <div className="grid grid-cols-2 gap-4">
          <InputField
            icon={MapPin}
            label="City"
            value={clientInfo.city}
            onChange={(v) => update('city', v)}
            placeholder="Miami"
          />
          <InputField
            label="ZIP Code"
            value={clientInfo.zip}
            onChange={(v) => update('zip', v)}
            placeholder="33139"
            maxLength={5}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={() => dispatch({ type: 'PREV_STEP' })}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <button
          disabled={!canProceed}
          onClick={() => dispatch({ type: 'NEXT_STEP' })}
          className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-lg transition-all cursor-pointer ${
            canProceed
              ? 'bg-primary text-white hover:bg-primary-light'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function InputField({ icon: Icon, label, type = 'text', value, onChange, placeholder, maxLength }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full border border-gray-200 rounded-lg py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-colors ${
            Icon ? 'pl-10 pr-4' : 'px-4'
          }`}
        />
      </div>
    </div>
  );
}
