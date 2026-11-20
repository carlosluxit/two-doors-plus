import { Shield, Clock, Lock, CheckCircle, ArrowRight, Star, BadgeDollarSign, Ruler, FileText } from 'lucide-react';
import { useQuoteDispatch } from '../context/QuoteContext';

const TRUST_ITEMS = [
  { icon: Clock, label: 'Instant Quote', desc: 'Real pricing in under 2 minutes' },
  { icon: Lock, label: 'Data Privacy', desc: 'Your info stays with us only' },
  { icon: BadgeDollarSign, label: 'Guaranteed Price', desc: 'Valid for 5 days, no surprises' },
  { icon: Shield, label: 'Miami-Dade Approved', desc: 'All products code-compliant' },
];

const STEPS_INFO = [
  { num: '1', icon: Ruler, title: 'Build Your Project', desc: 'Tell us about your doors and windows with simple measurements' },
  { num: '2', icon: FileText, title: 'Review Your Quote', desc: 'Get transparent pricing with product and installation breakdown' },
  { num: '3', icon: CheckCircle, title: 'Confirm Eligibility', desc: 'Free expert verification — no obligation, no pressure' },
];

export default function Landing() {
  const dispatch = useQuoteDispatch();
  const start = () => dispatch({ type: 'SET_STEP', step: 1 });

  return (
    <div className="animate-fade-in">
      {/* Hero with background image */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/hero-home.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/60" />
        </div>
        <div className="relative max-w-5xl mx-auto px-5 py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl">
            <div className="flex flex-wrap gap-2.5 mb-8">
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 text-white text-xs font-medium px-3.5 py-2 rounded-full">
                  <Icon className="w-3.5 h-3.5 text-accent" strokeWidth={2} />
                  {label}
                </span>
              ))}
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white mb-6">
              Hurricane Impact Windows & Doors. Made EZPZ.
            </h2>
            <p className="text-slate-300 text-lg sm:text-xl mb-10 max-w-lg leading-relaxed">
              See your exact price in under two minutes. Guaranteed pricing,
              professional installation, and a free expert verification visit the same week.
            </p>
            <button
              onClick={start}
              className="group relative inline-flex items-center gap-3 bg-amber-400 hover:bg-amber-300 text-primary px-8 py-4 rounded-xl text-base font-bold tracking-wide transition-all cursor-pointer shadow-xl shadow-amber-400/30 hover:shadow-2xl hover:shadow-amber-400/40 hover:-translate-y-0.5"
            >
              Get Your Free Quote
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" strokeWidth={2} />
            </button>
            <p className="text-slate-400 text-sm mt-6">
              500+ South Florida homeowners quoted this month.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-5">
          <p className="text-accent text-xs font-semibold tracking-widest uppercase text-center mb-3">Simple Process</p>
          <h3 className="text-3xl font-bold text-center text-primary mb-16">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-12">
            {STEPS_INFO.map(({ num, icon: Icon, title, desc }) => (
              <div key={num} className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-7 h-7 text-accent" strokeWidth={1.5} />
                </div>
                <h4 className="text-base font-bold text-primary mb-2">{title}</h4>
                <p className="text-sm text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <button
              onClick={start}
              className="group inline-flex items-center gap-3 bg-accent hover:bg-accent-light text-white px-8 py-4 rounded-xl text-base font-semibold tracking-wide transition-all cursor-pointer shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" strokeWidth={2} />
            </button>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-24 bg-primary">
        <div className="max-w-3xl mx-auto px-5">
          <p className="text-accent text-xs font-semibold tracking-widest uppercase text-center mb-3">The Difference</p>
          <h3 className="text-3xl font-bold text-center text-white mb-5">
            Why Homeowners Choose Us
          </h3>
          <p className="text-center text-slate-400 text-sm mb-14 max-w-md mx-auto">
            Real prices, quality products, and a team that stands behind every installation.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              'Instant, transparent pricing you can trust',
              'Your information stays private — always',
              'Guaranteed price locked in for 5 days',
              'All products Miami-Dade NOA approved',
              'Free professional verification visit at your home',
              'Flexible financing options available',
            ].map((item) => (
              <div key={item} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-sm text-slate-200 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-5">
          <p className="text-accent text-xs font-semibold tracking-widest uppercase text-center mb-3">Testimonials</p>
          <h3 className="text-3xl font-bold text-center text-primary mb-16">
            What Homeowners Say
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Maria G.', loc: 'Miami Beach', text: 'Finally a company that gives you a real price upfront. No games, no 10 sales people calling me.' },
              { name: 'James R.', loc: 'Coral Gables', text: 'Got my quote in 2 minutes. The verification visit was professional and no pressure at all.' },
              { name: 'Ana S.', loc: 'Fort Lauderdale', text: 'The windows are amazing. Price was exactly what they quoted online. Highly recommend!' },
            ].map((review) => (
              <div key={review.name} className="border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-base text-slate-700 leading-relaxed mb-5">&ldquo;{review.text}&rdquo;</p>
                <div className="text-sm font-bold text-primary">{review.name}</div>
                <div className="text-xs text-muted mt-0.5">{review.loc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/hero-measure.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/90" />
        </div>
        <div className="relative max-w-lg mx-auto px-5 py-24 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Protect Your Home?</h3>
          <p className="text-slate-300 text-base mb-10">
            Get your guaranteed quote in under 2 minutes. No obligations, no pressure.
          </p>
          <button
            onClick={start}
            className="group inline-flex items-center gap-3 bg-amber-400 hover:bg-amber-300 text-primary px-8 py-4 rounded-xl text-base font-bold tracking-wide transition-all cursor-pointer shadow-xl shadow-amber-400/30 hover:shadow-2xl hover:shadow-amber-400/40 hover:-translate-y-0.5"
          >
            Start My Free Quote
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" strokeWidth={2} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-dark py-12">
        <div className="max-w-5xl mx-auto px-5">
          <div className="grid sm:grid-cols-3 gap-8 text-left mb-8">
            <div>
              <h4 className="text-white text-sm font-semibold mb-3">EZPZ Windows</h4>
              <p className="text-slate-400 text-xs leading-relaxed">South Florida's trusted hurricane impact windows &amp; doors specialists. Miami-Dade NOA approved. Real quotes in 2 minutes.</p>
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold mb-3">Learn</h4>
              <ul className="space-y-1.5 text-xs">
                <li><a href="/hurricane-impact-windows-vs-shutters" className="text-slate-400 hover:text-slate-200 transition-colors">Impact windows vs shutters</a></li>
                <li><a href="/miami-dade-noa-explained" className="text-slate-400 hover:text-slate-200 transition-colors">Miami-Dade NOA explained</a></li>
                <li><a href="/best-hurricane-impact-window-brands" className="text-slate-400 hover:text-slate-200 transition-colors">Best impact window brands</a></li>
                <li><a href="/florida-hurricane-window-code-requirements" className="text-slate-400 hover:text-slate-200 transition-colors">Florida code requirements</a></li>
                <li><a href="/faq" className="text-slate-400 hover:text-slate-200 transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold mb-3">Company</h4>
              <ul className="space-y-1.5 text-xs">
                <li><a href="/about" className="text-slate-400 hover:text-slate-200 transition-colors">About</a></li>
                <li><a href="/contact" className="text-slate-400 hover:text-slate-200 transition-colors">Contact us</a></li>
                <li><a href="/terms" className="text-slate-400 hover:text-slate-200 transition-colors">Terms &amp; Conditions</a></li>
                <li><a href="mailto:info@ezpzwindows.com" className="text-slate-400 hover:text-slate-200 transition-colors">info@ezpzwindows.com</a></li>
                <li><a href="tel:+17865551234" className="text-slate-400 hover:text-slate-200 transition-colors">(786) 555-1234</a></li>
                <li>
                  <a href="https://www.instagram.com/doorsplususa?igsh=MTBndHplNzhucjA4OA==" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-white/10 text-center">
            <p className="text-slate-400 text-xs">&copy; 2026 EZPZ Windows. All rights reserved. Serving Miami-Dade, Broward &amp; Palm Beach counties.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
