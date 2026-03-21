import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const DOOR_VARIANTS: Record<string, string> = {
  traditional: 'Traditional',
  design: 'Design',
  wg_traditional: 'Wood Grain Traditional',
  wg_design: 'Wood Grain Design',
};

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  single_hung: 'Single Hung Window',
  horizontal_roller_xo: 'Horizontal Roller XO Window',
  horizontal_roller_xox: 'Horizontal Roller XOX Window',
  geometric: 'Geometric Shape Window',
  single_door: 'Single Door',
  bermuda_door: 'Bermuda Door',
  double_door: 'Double Door',
  picture_window: 'Picture Window (Door)',
  side_light: 'Side Light',
  sgd_2_panel: '2-Panel Sliding Glass Door',
  sgd_3_panel: '3-Panel Sliding Glass Door (XOX)',
  sgd_4_panel: '4-Panel Sliding Glass Door (XOOX)',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { quoteId } = await req.json();
    if (!quoteId) throw new Error('Missing quoteId');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Fetch quote + items
    const { data: quote, error: qErr } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single();
    if (qErr) throw qErr;

    const { data: items } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', quoteId)
      .order('sort_order');

    const itemRows = (items ?? [])
      .map((li: any) => {
        const typeName = PRODUCT_TYPE_LABELS[li.product_type] ?? li.product_type;
        const variant = li.door_variant ? ` (${DOOR_VARIANTS[li.door_variant] ?? li.door_variant})` : '';
        const displayPrice = li.unit_total > 0 ? `$${Math.round(li.base_price * 1.30).toLocaleString()}` : 'TBD';
        const displayInstall = li.unit_total > 0 ? `$${Math.round(li.install_fee).toLocaleString()}` : 'TBD';
        const lineTotal = li.line_total > 0 ? `$${Math.round(li.line_total).toLocaleString()}` : 'TBD';
        return `
          <tr>
            <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;">${li.label || typeName}${variant}</td>
            <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;text-align:center;">${li.width}" × ${li.height}"</td>
            <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;text-align:center;">${li.quantity}</td>
            <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;text-align:right;">${displayPrice}</td>
            <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;text-align:right;">${displayInstall}</td>
            <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:600;">${lineTotal}</td>
          </tr>`;
      })
      .join('');

    const totalDisplay = quote.total > 0
      ? `$${Math.round(quote.total).toLocaleString()}`
      : 'Custom — our team will follow up';

    const expiryDate = new Date(quote.created_at);
    expiryDate.setDate(expiryDate.getDate() + 5);
    const fmtDate = (d: Date) =>
      d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e3a5f,#2d5a8e);padding:40px 32px;text-align:center;">
      <div style="font-size:13px;color:#93c5fd;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:8px;">Doors Plus + USA</div>
      <h1 style="color:#fff;margin:0 0 8px;font-size:28px;font-weight:800;">Your Quote is Ready</h1>
      <div style="font-size:14px;color:#93c5fd;">Quote #${quote.quote_number}</div>
      <div style="margin-top:20px;background:rgba(255,255,255,0.1);border-radius:12px;padding:16px 24px;display:inline-block;">
        <div style="font-size:36px;font-weight:900;color:#f59e0b;">${totalDisplay}</div>
        <div style="font-size:12px;color:#93c5fd;margin-top:4px;">Estimated Total · Valid until ${fmtDate(expiryDate)}</div>
      </div>
    </div>

    <!-- Client Info -->
    <div style="padding:28px 32px;border-bottom:1px solid #f3f4f6;">
      <h2 style="margin:0 0 16px;font-size:16px;color:#111827;">Project Details</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#374151;">
        <tr>
          <td style="padding:4px 0;color:#9ca3af;width:120px;">Client</td>
          <td style="padding:4px 0;font-weight:600;">${quote.client_first_name} ${quote.client_last_name}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#9ca3af;">Phone</td>
          <td style="padding:4px 0;">${quote.client_phone}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#9ca3af;">Property</td>
          <td style="padding:4px 0;">${quote.client_address ? `${quote.client_address}, ` : ''}${quote.client_city} ${quote.client_zip}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#9ca3af;">Price List</td>
          <td style="padding:4px 0;">${quote.price_list_name ?? '—'}</td>
        </tr>
      </table>
    </div>

    <!-- Items table -->
    <div style="padding:28px 32px;border-bottom:1px solid #f3f4f6;">
      <h2 style="margin:0 0 16px;font-size:16px;color:#111827;">Bill of Materials</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#f9fafb;color:#6b7280;">
            <th style="padding:10px 16px;text-align:left;font-weight:600;">Item</th>
            <th style="padding:10px 16px;text-align:center;font-weight:600;">Size</th>
            <th style="padding:10px 16px;text-align:center;font-weight:600;">Qty</th>
            <th style="padding:10px 16px;text-align:right;font-weight:600;">Price</th>
            <th style="padding:10px 16px;text-align:right;font-weight:600;">Install</th>
            <th style="padding:10px 16px;text-align:right;font-weight:600;">Total</th>
          </tr>
        </thead>
        <tbody style="color:#374151;">
          ${itemRows}
        </tbody>
      </table>

      ${quote.total > 0 ? `
      <div style="margin-top:16px;text-align:right;font-size:14px;color:#374151;">
        <div style="font-size:20px;font-weight:800;color:#1e3a5f;">Total (incl. installation): ${totalDisplay}</div>
      </div>` : ''}
    </div>

    <!-- Guarantee -->
    <div style="padding:24px 32px;background:#fffbeb;border-bottom:1px solid #f3f4f6;">
      <div style="font-size:14px;color:#92400e;">
        <strong>⚡ 5-Day Price Guarantee</strong> — This quote is guaranteed until ${fmtDate(expiryDate)},
        subject to on-site measurement verification. Schedule your free expert visit to lock in this price.
      </div>
    </div>

    <!-- CTA -->
    <div style="padding:32px;text-align:center;">
      <a href="tel:7865551234" style="display:inline-block;background:#1e3a5f;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;margin-bottom:16px;">
        📞 Call to Schedule: (786) 555-1234
      </a>
      <div style="font-size:12px;color:#9ca3af;margin-top:8px;">
        Doors Plus + USA · South Florida's Hurricane Impact Window & Door Specialists
      </div>
    </div>
  </div>
</body>
</html>`;

    // Send via Resend
    if (RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Doors Plus + <quotes@twodoorsplus.com>',
          to: [quote.client_email],
          bcc: ['admin@twodoorsplus.com'],
          subject: `Your Hurricane Impact Quote — ${quote.quote_number}`,
          html,
        }),
      });

      // Mark as sent
      await supabase
        .from('quotes')
        .update({ status: 'sent', email_sent_at: new Date().toISOString() })
        .eq('id', quoteId);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
