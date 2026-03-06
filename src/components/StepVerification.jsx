import { useState, useEffect } from 'react';
import { useQuote, useQuoteDispatch } from '../context/QuoteContext';
import { ArrowLeft, Mail, MessageSquare, CheckCircle } from 'lucide-react';

export default function StepVerification() {
  const state = useQuote();
  const dispatch = useQuoteDispatch();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [method, setMethod] = useState('email'); // 'email' or 'sms'
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  // Simulate sending code
  const sendCode = () => {
    setSent(true);
    setError('');
  };

  const handleCodeChange = (index, value) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const next = document.getElementById(`code-${index + 1}`);
      if (next) next.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prev = document.getElementById(`code-${index - 1}`);
      if (prev) prev.focus();
    }
  };

  const verifyCode = () => {
    const fullCode = code.join('');
    // POC: Accept any 6-digit code
    if (fullCode.length === 6) {
      setVerified(true);
      dispatch({ type: 'SET_VERIFICATION_CODE', code: fullCode });
      // Auto proceed after verification animation
      setTimeout(() => {
        dispatch({ type: 'GENERATE_QUOTE' });
        dispatch({ type: 'NEXT_STEP' });
      }, 1500);
    } else {
      setError('Please enter the full 6-digit code.');
    }
  };

  const maskedEmail = state.clientInfo.email
    ? state.clientInfo.email.replace(/(.{2}).*(@.*)/, '$1***$2')
    : '';
  const maskedPhone = state.clientInfo.phone
    ? '***-***-' + state.clientInfo.phone.slice(-4)
    : '';

  if (verified) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verified!</h2>
        <p className="text-gray-500">Generating your guaranteed quote...</p>
        <div className="mt-6">
          <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-success rounded-full animate-[pulse_1s_ease-in-out_infinite]" style={{ width: '70%' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 animate-fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
        Verify Your Contact
      </h2>
      <p className="text-gray-500 text-center mb-8">
        We'll send a 6-digit code to confirm your information.
      </p>

      {!sent ? (
        <>
          {/* Method Selection */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => setMethod('email')}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                method === 'email'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Mail className="w-6 h-6 text-primary" />
              <div>
                <div className="font-semibold text-gray-900">Email</div>
                <div className="text-sm text-gray-500">{maskedEmail}</div>
              </div>
            </button>
            <button
              onClick={() => setMethod('sms')}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                method === 'sms'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="w-6 h-6 text-primary" />
              <div>
                <div className="font-semibold text-gray-900">Text Message</div>
                <div className="text-sm text-gray-500">{maskedPhone}</div>
              </div>
            </button>
          </div>

          <button
            onClick={sendCode}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold text-lg hover:bg-primary-light transition-colors cursor-pointer"
          >
            Send Verification Code
          </button>
        </>
      ) : (
        <>
          <p className="text-center text-sm text-gray-500 mb-6">
            Code sent to{' '}
            <span className="font-medium text-gray-900">
              {method === 'email' ? maskedEmail : maskedPhone}
            </span>
          </p>

          {/* Code Input */}
          <div className="flex justify-center gap-2 mb-4">
            {code.map((digit, i) => (
              <input
                key={i}
                id={`code-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary outline-none transition-colors"
              />
            ))}
          </div>

          {error && (
            <p className="text-center text-sm text-danger mb-4">{error}</p>
          )}

          <button
            onClick={verifyCode}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold text-lg hover:bg-primary-light transition-colors cursor-pointer"
          >
            Verify & Get Quote
          </button>

          <button
            onClick={() => { setSent(false); setCode(['', '', '', '', '', '']); setError(''); }}
            className="w-full text-center text-sm text-primary mt-4 hover:underline cursor-pointer"
          >
            Didn't receive it? Resend code
          </button>

          <p className="text-center text-xs text-gray-400 mt-2">
            (POC Demo: Enter any 6 digits to continue)
          </p>
        </>
      )}

      {/* Back */}
      <div className="mt-8">
        <button
          onClick={() => dispatch({ type: 'PREV_STEP' })}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
      </div>
    </div>
  );
}
