import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';

export default function AdminApp() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) await checkAdmin(session.user.id);
      setChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        await checkAdmin(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function checkAdmin(userId) {
    const { data } = await supabase
      .from('admin_profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    setIsAdmin(!!data);
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session || !isAdmin) return <AdminLogin />;
  return <AdminLayout session={session} />;
}
