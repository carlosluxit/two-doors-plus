import { Shield, Phone } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Shield className="w-7 h-7 text-accent" strokeWidth={1.5} />
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-primary">Two Doors Plus</h1>
            <p className="text-[11px] text-muted hidden sm:block tracking-wide uppercase">Hurricane Impact Doors & Windows</p>
          </div>
        </div>
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
