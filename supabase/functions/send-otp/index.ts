import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
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

function generateCode() {
  // 6-digit numeric, zero-padded
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
}

function emailHtml(code: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="background:#0f2942;padding:32px;text-align:center;">
      <div style="font-size:12px;color:#93c5fd;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;">EZPZ Windows</div>
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;">Verify Your Quote</h1>
    </div>
    <div style="padding:32px;text-align:center;">
      <p style="margin:0 0 16px;font-size:14px;color:#374151;">Your verification code is:</p>
      <div style="display:inline-block;background:#f3f4f6;padding:18px 28px;border-radius:12px;font-size:34px;font-weight:800;letter-spacing:8px;color:#0f2942;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">
        ${code}
      </div>
      <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
    </div>
    <div style="padding:16px 32px;border-top:1px solid #f3f4f6;text-align:center;font-size:11px;color:#9ca3af;">
      EZPZ Windows · South Florida's Hurricane Impact Door & Window Specialists
    </div>
  </div>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

  try {
    const { email } = await req.json();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Rate-limit: no more than 5 codes in the last 15 min per identifier
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('otp_codes')
      .select('id', { count: 'exact', head: true })
      .eq('identifier', email.toLowerCase())
      .gte('created_at', fifteenMinAgo);
    if ((count ?? 0) >= 5) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please wait and try again.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    const code = generateCode();
    const codeHash = await sha256Hex(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: insertErr } = await supabase.from('otp_codes').insert({
      identifier: email.toLowerCase(),
      code_hash: codeHash,
      expires_at: expiresAt,
    });
    if (insertErr) throw insertErr;

    if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY missing — code NOT sent:', code);
      return new Response(JSON.stringify({ ok: true, devCode: code }), {
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'EZPZ Windows <info@ezpzwindows.com>',
        to: [email],
        subject: `Your EZPZ Windows verification code: ${code}`,
        html: emailHtml(code),
      }),
    });

    if (!r.ok) {
      const body = await r.text();
      console.error('Resend send-otp failed:', r.status, body);
      return new Response(JSON.stringify({ error: 'Failed to send code' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  } catch (err) {
    console.error('send-otp error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }
});
