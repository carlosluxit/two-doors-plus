import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Shield, LogIn, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-primary-dark flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-accent" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-semibold text-primary">Two Doors Plus</h1>
          <p className="text-muted text-xs uppercase tracking-wide mt-1">Admin Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-medium text-muted uppercase tracking-wide mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:border-accent outline-none transition-colors"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-muted uppercase tracking-wide mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:border-accent outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-danger bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" strokeWidth={1.5} />}
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
