import { Shield, Clock, DollarSign, CheckCircle, ArrowRight, Star, Lock, Zap } from 'lucide-react';
import { useQuoteDispatch } from '../context/QuoteContext';

const TRUST_ITEMS = [
  { icon: Clock, label: 'Instant Quote', desc: 'Real pricing in under 2 minutes' },
  { icon: Lock, label: 'No Data Selling', desc: 'Your info stays with us only' },
  { icon: DollarSign, label: 'Guaranteed Price', desc: 'Valid for 5 days, no surprises' },
  { icon: Shield, label: 'Miami-Dade Approved', desc: 'All products code-compliant' },
];

const STEPS_INFO = [
  { num: '1', title: 'Enter Your Project', desc: 'Tell us about your doors and windows' },
  { num: '2', title: 'Choose Your Tier', desc: 'Economic, Premium, or Pro options' },
  { num: '3', title: 'Get Instant Quote', desc: 'Real pricing, guaranteed for 5 days' },
];

export default function Landing() {
  const dispatch = useQuoteDispatch();

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary-light to-primary text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-sm mb-6">
              <Zap className="w-4 h-4 text-accent" />
              South Florida's Trusted Impact Window Experts
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Get a <span className="text-accent">Real Quote</span> for Hurricane Impact
              <br />Doors & Windows
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl">
              No fake "instant quotes" that sell your data. Get transparent, guaranteed pricing
              in under 2 minutes. No pressure, no games.
            </p>
            <button
              onClick={() => dispatch({ type: 'SET_STEP', step: 1 })}
              className="inline-flex items-center gap-3 bg-accent hover:bg-accent-dark text-primary-dark px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 animate-pulse-glow cursor-pointer"
            >
              Get Your Free Instant Quote
              <ArrowRight className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4 mt-6 text-sm text-blue-200">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 border-2 border-primary flex items-center justify-center text-xs font-bold"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span>500+ South Florida homeowners quoted this month</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST_ITEMS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="bg-primary/5 p-2 rounded-lg">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{label}</div>
                  <div className="text-sm text-gray-500">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS_INFO.map(({ num, title, desc }) => (
              <div
                key={num}
                className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-accent text-primary-dark rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {num}
                </div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">{title}</h4>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Why Homeowners Choose Us
          </h3>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
            Most "instant quote" tools collect your info and sell it to multiple companies.
            We give you real pricing.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              'True instant pricing — not a bait-and-switch lead form',
              'Your information is never sold to third parties',
              'Guaranteed price valid for 5 days',
              'All products Miami-Dade NOA approved',
              'Professional verification visit — no high-pressure sales',
              'Financing options available',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What Homeowners Say
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Maria G.', loc: 'Miami Beach', text: 'Finally a company that gives you a real price upfront. No games, no 10 salespeople calling me.' },
              { name: 'James R.', loc: 'Coral Gables', text: 'Got my quote in 2 minutes. The verification visit was professional and no pressure at all.' },
              { name: 'Ana S.', loc: 'Fort Lauderdale', text: 'The Pro tier windows are amazing. Price was exactly what they quoted online. Highly recommend!' },
            ].map((review) => (
              <div key={review.name} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-4">"{review.text}"</p>
                <div className="text-sm font-semibold text-gray-900">{review.name}</div>
                <div className="text-xs text-gray-400">{review.loc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Protect Your Home?</h3>
          <p className="text-blue-200 mb-8">
            Get your guaranteed quote in under 2 minutes. No obligations, no pressure.
          </p>
          <button
            onClick={() => dispatch({ type: 'SET_STEP', step: 1 })}
            className="inline-flex items-center gap-3 bg-accent hover:bg-accent-dark text-primary-dark px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 cursor-pointer"
          >
            Start My Free Quote
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-dark text-blue-200 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm">
          <p>&copy; 2026 Two Doors Plus USA. All rights reserved.</p>
          <p className="mt-2 text-blue-300/50">South Florida's Trusted Hurricane Impact Door & Window Experts</p>
        </div>
      </footer>
    </div>
  );
}
