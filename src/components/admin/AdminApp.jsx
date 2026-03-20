import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';

export default function AdminApp() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Timeout safety — if getSession hangs, show login after 3s
    const timeout = setTimeout(() => {
      if (mounted && checking) setChecking(false);
    }, 3000);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      if (session) await checkAdmin();
      setChecking(false);
    }).catch(() => {
      if (mounted) setChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setSession(session);
      if (session) {
        await checkAdmin();
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  async function checkAdmin() {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) {
        console.error('checkAdmin error:', error.message);
        setIsAdmin(false);
        return;
      }
      setIsAdmin(!!data);
    } catch {
      setIsAdmin(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session || !isAdmin) return <AdminLogin />;
  return <AdminLayout session={session} />;
}
