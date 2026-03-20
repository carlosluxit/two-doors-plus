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
      {/* Hero */}
      <section className="bg-primary">
        <div className="max-w-5xl mx-auto px-5 py-20 sm:py-28 lg:py-32">
          <div className="max-w-2xl">
            <p className="text-accent text-sm font-medium tracking-widest uppercase mb-6">
              South Florida's Trusted Experts
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-white mb-6">
              Hurricane Impact Doors & Windows.{' '}
              <span className="text-accent">Transparent pricing.</span>
            </h2>
            <p className="text-stone-400 text-base sm:text-lg mb-10 max-w-lg leading-relaxed">
              No bait-and-switch lead forms. Get a real, guaranteed quote
              in under two minutes — your information is never sold.
            </p>
            <button
              onClick={start}
              className="group inline-flex items-center gap-3 bg-accent hover:bg-accent-light text-primary px-7 py-3.5 rounded-lg text-sm font-semibold tracking-wide transition-all cursor-pointer"
            >
              Get Your Free Quote
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </button>
            <p className="text-stone-500 text-xs mt-5">
              500+ South Florida homeowners quoted this month
            </p>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-b border-border">
        <div className="max-w-5xl mx-auto px-5 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST_ITEMS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <Icon className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <div className="text-sm font-medium text-primary">{label}</div>
                  <div className="text-xs text-muted mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-5">
          <h3 className="text-2xl font-semibold text-center text-primary mb-14">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-10">
            {STEPS_INFO.map(({ num, icon: Icon, title, desc }) => (
              <div key={num} className="text-center">
                <div className="w-10 h-10 border border-border rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-4 h-4 text-accent" strokeWidth={1.5} />
                </div>
                <h4 className="text-sm font-semibold text-primary mb-1.5">{title}</h4>
                <p className="text-xs text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-3xl mx-auto px-5">
          <h3 className="text-2xl font-semibold text-center text-primary mb-4">
            Why Homeowners Choose Us
          </h3>
          <p className="text-center text-muted text-sm mb-12 max-w-md mx-auto">
            Most "instant quote" tools collect your info and sell it to multiple companies. We give you real pricing.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'True instant pricing — not a bait-and-switch lead form',
              'Your information is never sold to third parties',
              'Guaranteed price valid for 5 days',
              'All products Miami-Dade NOA approved',
              'Professional verification visit — no high-pressure sales',
              'Financing options available',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 p-3.5 rounded-lg">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span className="text-sm text-stone-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-5">
          <h3 className="text-2xl font-semibold text-center text-primary mb-14">
            What Homeowners Say
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Maria G.', loc: 'Miami Beach', text: 'Finally a company that gives you a real price upfront. No games, no 10 salespeople calling me.' },
              { name: 'James R.', loc: 'Coral Gables', text: 'Got my quote in 2 minutes. The verification visit was professional and no pressure at all.' },
              { name: 'Ana S.', loc: 'Fort Lauderdale', text: 'The windows are amazing. Price was exactly what they quoted online. Highly recommend!' },
            ].map((review) => (
              <div key={review.name} className="border border-border rounded-lg p-5">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm text-stone-600 leading-relaxed mb-4">&ldquo;{review.text}&rdquo;</p>
                <div className="text-xs font-medium text-primary">{review.name}</div>
                <div className="text-[11px] text-muted">{review.loc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-primary py-20">
        <div className="max-w-lg mx-auto px-5 text-center">
          <h3 className="text-2xl font-semibold text-white mb-3">Ready to Protect Your Home?</h3>
          <p className="text-stone-400 text-sm mb-8">
            Get your guaranteed quote in under 2 minutes. No obligations, no pressure.
          </p>
          <button
            onClick={start}
            className="group inline-flex items-center gap-3 bg-accent hover:bg-accent-light text-primary px-7 py-3.5 rounded-lg text-sm font-semibold tracking-wide transition-all cursor-pointer"
          >
            Start My Free Quote
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-dark py-8">
        <div className="max-w-5xl mx-auto px-5 text-center">
          <p className="text-stone-500 text-xs">&copy; 2026 Two Doors Plus USA. All rights reserved.</p>
          <p className="text-stone-600 text-[11px] mt-1.5">South Florida's Trusted Hurricane Impact Door & Window Experts</p>
        </div>
      </footer>
    </div>
  );
}
