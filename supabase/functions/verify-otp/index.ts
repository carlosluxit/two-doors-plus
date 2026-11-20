import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function sha256Hex(text: string) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

const MAX_ATTEMPTS = 5;

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

  try {
    const { email, code } = await req.json();
    if (!email || !code || !/^\d{6}$/.test(String(code))) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const identifier = String(email).toLowerCase();
    const codeHash = await sha256Hex(String(code));

    // Find the most recent unused, unexpired code for this identifier
    const { data: rows, error: qErr } = await supabase
      .from('otp_codes')
      .select('id, code_hash, expires_at, used_at, attempts')
      .eq('identifier', identifier)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (qErr) throw qErr;

    const row = rows && rows[0];
    if (!row) {
      return new Response(JSON.stringify({ error: 'No active code. Please request a new one.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    if (row.attempts >= MAX_ATTEMPTS) {
      return new Response(JSON.stringify({ error: 'Too many attempts. Please request a new code.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    if (row.code_hash !== codeHash) {
      // Increment attempts
      await supabase.from('otp_codes').update({ attempts: row.attempts + 1 }).eq('id', row.id);
      return new Response(JSON.stringify({ error: 'Incorrect code.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    // Mark as used
    await supabase.from('otp_codes').update({ used_at: new Date().toISOString() }).eq('id', row.id);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  } catch (err) {
    console.error('verify-otp error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }
});
