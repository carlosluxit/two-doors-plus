import { Shield, Phone } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-accent" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Two Doors Plus</h1>
            <p className="text-xs text-blue-200 hidden sm:block">Hurricane Impact Doors & Windows</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="tel:+17865551234"
            className="flex items-center gap-2 bg-accent text-primary-dark px-4 py-2 rounded-lg font-semibold text-sm hover:bg-accent-dark transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">(786) 555-1234</span>
            <span className="sm:hidden">Call</span>
          </a>
        </div>
      </div>
    </header>
  );
}
