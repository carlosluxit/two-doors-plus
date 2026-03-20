import { Shield, Clock, Lock, CheckCircle, ArrowRight, Star, BadgeDollarSign, Ruler, FileText } from 'lucide-react';
import { useQuoteDispatch } from '../context/QuoteContext';

const TRUST_ITEMS = [
  { icon: Clock, label: 'Instant Quote', desc: 'Real pricing in under 2 minutes' },
  { icon: Lock, label: 'No Data Selling', desc: 'Your info stays with us only' },
  { icon: BadgeDollarSign, label: 'Guaranteed Price', desc: 'Valid for 5 days, no surprises' },
  { icon: Shield, label: 'Miami-Dade Approved', desc: 'All products code-compliant' },
];

const STEPS_INFO = [
  { num: '1', icon: Ruler, title: 'Enter Your Project', desc: 'Tell us about your doors and windows with simple measurements' },
  { num: '2', icon: FileText, title: 'Review Your Quote', desc: 'Get transparent pricing with product and installation breakdown' },
  { num: '3', icon: CheckCircle, title: 'Schedule a Visit', desc: 'Free expert verification — no obligation, no pressure' },
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
              Hurricane Impact Doors & Windows.{' '}
              <span className="text-accent">Transparent pricing.</span>
            </h2>
            <p className="text-slate-300 text-lg sm:text-xl mb-10 max-w-lg leading-relaxed">
              See your exact price in under two minutes. Guaranteed pricing,
              professional installation, and a free expert verification visit.
            </p>
            <button
              onClick={start}
              className="group inline-flex items-center gap-3 bg-accent hover:bg-accent-light text-white px-8 py-4 rounded-xl text-base font-semibold tracking-wide transition-all cursor-pointer shadow-xl shadow-accent/30 hover:shadow-2xl hover:shadow-accent/40 hover:-translate-y-0.5"
            >
              Get Your Free Quote
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" strokeWidth={2} />
            </button>
            <p className="text-slate-400 text-sm mt-6">
              500+ South Florida homeowners quoted this month
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
            Real prices, real products, and a team that stands behind every installation.
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
              { name: 'Maria G.', loc: 'Miami Beach', text: 'Finally a company that gives you a real price upfront. No games, no 10 salespeople calling me.' },
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
            className="group inline-flex items-center gap-3 bg-accent hover:bg-accent-light text-white px-8 py-4 rounded-xl text-base font-semibold tracking-wide transition-all cursor-pointer shadow-xl shadow-accent/30 hover:shadow-2xl hover:shadow-accent/40 hover:-translate-y-0.5"
          >
            Start My Free Quote
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" strokeWidth={2} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-dark py-10">
        <div className="max-w-5xl mx-auto px-5 text-center">
          <p className="text-slate-400 text-sm">&copy; 2026 Doors Plus + USA. All rights reserved.</p>
          <p className="text-slate-500 text-xs mt-2">South Florida's Trusted Hurricane Impact Door & Window Experts</p>
        </div>
      </footer>
    </div>
  );
}
