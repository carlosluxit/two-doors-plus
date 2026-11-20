import { useState } from 'react';
import { Send, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const { error } = await supabase.from('contact_messages').insert([
        { name: form.name, email: form.email, phone: form.phone || null, message: form.message },
      ]);
      if (error) throw error;
      setStatus('sent');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Logo Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center">
          <a href="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="EZPZ Windows" className="w-10 h-11" />
            <div className="text-left">
              <span className="text-lg font-semibold tracking-tight text-primary">EZPZ Windows</span>
              <p className="text-[11px] text-muted hidden sm:block tracking-wide uppercase">Hurricane Impact Windows & Doors</p>
            </div>
          </a>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-primary text-white py-16">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Contact Us</h1>
          <p className="text-slate-300 text-lg max-w-lg mx-auto">
            Have a question or need help? We'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-12">
        <div className="grid md:grid-cols-[1fr_300px] gap-10">
          {/* Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
            {status === 'sent' ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-500 text-sm mb-6">We'll get back to you as soon as possible.</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="text-sm text-accent hover:underline cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={update('name')}
                    placeholder="Your full name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={update('email')}
                    placeholder="you@example.com"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={update('phone')}
                    placeholder="(786) 555-1234"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={update('message')}
                    placeholder="How can we help you?"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-sm text-red-600">Something went wrong. Please try again or email us directly.</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" strokeWidth={1.5} />
                  {status === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone</p>
                    <a href="tel:+17865551234" className="text-sm text-gray-500 hover:text-accent">(786) 555-1234</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <a href="mailto:info@ezpzwindows.com" className="text-sm text-gray-500 hover:text-accent">info@ezpzwindows.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Service Area</p>
                    <p className="text-sm text-gray-500">South Florida</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-accent/5 border border-accent/20 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Need a Quote?</h3>
              <p className="text-xs text-gray-600 mb-3">
                Get instant pricing for hurricane impact windows and doors in under 2 minutes.
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-dark transition-colors"
              >
                Get Your Free Quote &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center text-sm text-gray-400 py-8 border-t border-gray-200">
        &copy; {new Date().getFullYear()} EZPZ Windows. All rights reserved.
      </footer>
    </div>
  );
}
