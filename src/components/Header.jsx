import { Phone } from 'lucide-react';
import { useQuote, useQuoteDispatch } from '../context/QuoteContext';

export default function Header() {
  const state = useQuote();
  const dispatch = useQuoteDispatch();

  const handleLogoClick = () => {
    if (state.step === 0) return;
    if (window.confirm('Leave the quote? All progress will be lost.')) {
      dispatch({ type: 'RESET' });
    }
  };

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-5 py-3.5 flex items-center justify-between">
        <button onClick={handleLogoClick} className="flex items-center gap-2.5 cursor-pointer">
          <img src="/logo.svg" alt="Doors Plus" className="w-10 h-11" />
          <div className="text-left">
            <h1 className="text-lg font-semibold tracking-tight text-primary">Doors Plus</h1>
            <p className="text-[11px] text-muted hidden sm:block tracking-wide uppercase">Hurricane Impact Doors & Windows</p>
          </div>
        </button>
        <a
          href="tel:+17865551234"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-accent transition-colors"
        >
          <Phone className="w-4 h-4" strokeWidth={1.5} />
          <span className="hidden sm:inline">(786) 555-1234</span>
        </a>
      </div>
    </header>
  );
}
