import { useState } from 'react';
import { useQuote, useQuoteDispatch } from '../context/QuoteContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Mail, MessageSquare, Check, Loader2 } from 'lucide-react';

export default function StepVerification() {
  const state = useQuote();
  const dispatch = useQuoteDispatch();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [method, setMethod] = useState('email'); // sms disabled for now
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  const email = state.clientInfo.email;

  const sendCode = async () => {
    setError('');
    setSending(true);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('send-otp', {
        body: { email },
      });
      if (fnErr) throw fnErr;
      if (data?.error) throw new Error(data.error);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Could not send the verification code. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleCodeChange = (index, value) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

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

  const verifyCode = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    setError('');
    setVerifying(true);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('verify-otp', {
        body: { email, code: fullCode },
      });
      if (fnErr) throw fnErr;
      if (!data?.ok) {
        throw new Error(data?.error || 'Verification failed');
      }
      setVerified(true);
      dispatch({ type: 'SET_VERIFICATION_CODE', code: fullCode });
      setTimeout(() => {
        dispatch({ type: 'NEXT_STEP' });
      }, 1200);
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const maskedEmail = email
    ? email.replace(/(.{2}).*(@.*)/, '$1***$2')
    : '';
  const maskedPhone = state.clientInfo.phone
    ? '***-***-' + state.clientInfo.phone.slice(-4)
    : '';

  if (verified) {
    return (
      <div className="max-w-sm mx-auto px-5 py-20 text-center animate-fade-in">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <Check className="w-7 h-7 text-success" strokeWidth={2} />
        </div>
        <h2 className="text-lg font-semibold text-primary mb-1.5">Verified</h2>
        <p className="text-sm text-muted">Generating your guaranteed quote...</p>
        <div className="mt-6">
          <div className="w-40 h-1 bg-slate-100 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-accent rounded-full animate-subtle-pulse" style={{ width: '70%' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-5 py-14 animate-fade-in">
      <h2 className="text-xl font-semibold text-primary text-center mb-1.5">
        Verify Your Contact
      </h2>
      <p className="text-sm text-muted text-center mb-10">
        We'll email you a 6-digit code to confirm your information.
      </p>

      {!sent ? (
        <>
          <div className="space-y-2.5 mb-8">
            {[
              { id: 'email', icon: Mail, label: 'Email', detail: maskedEmail, disabled: false },
              { id: 'sms', icon: MessageSquare, label: 'Text Message', detail: maskedPhone, disabled: true },
            ].map(({ id, icon: Icon, label, detail, disabled }) => (
              <button
                key={id}
                onClick={() => !disabled && setMethod(id)}
                disabled={disabled}
                className={`w-full flex items-center gap-3.5 p-3.5 rounded-lg border text-left transition-all ${
                  disabled
                    ? 'opacity-50 cursor-not-allowed border-border'
                    : method === id
                    ? 'border-accent bg-accent/5 cursor-pointer'
                    : 'border-border hover:border-slate-300 cursor-pointer'
                }`}
              >
                <Icon className={`w-4 h-4 ${method === id && !disabled ? 'text-accent' : 'text-muted'}`} strokeWidth={1.5} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-primary">
                    {label}
                    {disabled && <span className="ml-2 text-[10px] font-normal text-muted">Coming soon</span>}
                  </div>
                  <div className="text-xs text-muted">{detail}</div>
                </div>
              </button>
            ))}
          </div>

          {error && <p className="text-center text-xs text-danger mb-3">{error}</p>}

          <button
            onClick={sendCode}
            disabled={sending}
            className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {sending && <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />}
            {sending ? 'Sending…' : 'Send Verification Code'}
          </button>
        </>
      ) : (
        <>
          <p className="text-center text-xs text-muted mb-6">
            Code sent to{' '}
            <span className="font-medium text-primary">{maskedEmail}</span>
          </p>

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
                disabled={verifying}
                className="w-10 h-12 text-center text-lg font-semibold border border-border rounded-md focus:border-accent outline-none transition-colors disabled:opacity-60"
              />
            ))}
          </div>

          {error && <p className="text-center text-xs text-danger mb-4">{error}</p>}

          <button
            onClick={verifyCode}
            disabled={verifying}
            className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {verifying && <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />}
            {verifying ? 'Verifying…' : 'Verify & Get Quote'}
          </button>

          <button
            onClick={() => { setSent(false); setCode(['', '', '', '', '', '']); setError(''); }}
            className="w-full text-center text-xs text-muted mt-4 hover:text-primary cursor-pointer"
          >
            Didn't receive it? Resend code
          </button>
        </>
      )}

      <div className="mt-10">
        <button
          onClick={() => dispatch({ type: 'PREV_STEP' })}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-muted hover:text-primary hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Back
        </button>
      </div>
    </div>
  );
}
