import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';

export default function AdminApp() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const checkedRef = useRef(false);

  // Track auth state — no async calls inside the callback
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setIsAdmin(false);
        checkedRef.current = false;
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Check admin status whenever session changes
  useEffect(() => {
    if (!session) {
      setChecking(false);
      return;
    }
    if (checkedRef.current) return;
    checkedRef.current = true;

    const token = session.access_token;
    const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/is_admin`;

    fetch(url, {
      method: 'POST',
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    })
      .then((r) => r.json())
      .then((data) => {
        setIsAdmin(!!data);
        setChecking(false);
      })
      .catch(() => {
        setIsAdmin(false);
        setChecking(false);
      });
  }, [session]);

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
