import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1';
import { encodeBase64 } from 'https://deno.land/std@0.224.0/encoding/base64.ts';

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

async function generateQuotePdf(quote: any, items: any[]): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const pageW = 612;
  const pageH = 792;
  const margin = 40;
  const navy = rgb(0.118, 0.227, 0.373);
  const amber = rgb(0.961, 0.620, 0.043);
  const gray = rgb(0.6, 0.6, 0.6);
  const lightGray = rgb(0.92, 0.92, 0.92);
  const dark = rgb(0.067, 0.094, 0.153);

  let page = pdf.addPage([pageW, pageH]);
  let y = pageH - margin;

  // Header bar
  page.drawRectangle({ x: 0, y: pageH - 120, width: pageW, height: 120, color: navy });
  page.drawText('EZPZ WINDOWS', { x: margin, y: pageH - 50, size: 11, font: bold, color: rgb(0.58, 0.76, 0.99) });
  page.drawText('Your Quote', { x: margin, y: pageH - 75, size: 22, font: bold, color: rgb(1, 1, 1) });
  page.drawText(`Quote #${quote.quote_number}`, { x: margin, y: pageH - 98, size: 11, font, color: rgb(0.58, 0.76, 0.99) });

  // Total box (right side)
  const total = quote.total > 0 ? `$${Math.round(quote.total).toLocaleString()}` : 'Custom';
  const totalW = bold.widthOfTextAtSize(total, 24);
  page.drawText('TOTAL', { x: pageW - margin - 100, y: pageH - 50, size: 9, font, color: rgb(0.58, 0.76, 0.99) });
  page.drawText(total, { x: pageW - margin - totalW, y: pageH - 75, size: 24, font: bold, color: amber });
  const expiryDate = new Date(quote.created_at);
  expiryDate.setDate(expiryDate.getDate() + 5);
  const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const expText = `Valid until ${fmtDate(expiryDate)}`;
  const expW = font.widthOfTextAtSize(expText, 9);
  page.drawText(expText, { x: pageW - margin - expW, y: pageH - 98, size: 9, font, color: rgb(0.58, 0.76, 0.99) });

  y = pageH - 160;

  // Project Details
  page.drawText('Project Details', { x: margin, y, size: 13, font: bold, color: dark });
  y -= 20;
  const details: [string, string][] = [
    ['Client', `${quote.client_first_name} ${quote.client_last_name}`],
    ['Phone', quote.client_phone ?? ''],
    ['Email', quote.client_email ?? ''],
    ['Property', `${quote.client_address ? quote.client_address + ', ' : ''}${quote.client_city ?? ''} ${quote.client_zip ?? ''}`.trim()],
  ];
  for (const [label, value] of details) {
    page.drawText(label, { x: margin, y, size: 10, font, color: gray });
    page.drawText(value, { x: margin + 90, y, size: 10, font, color: dark });
    y -= 16;
  }

  y -= 10;

  // Bill of Materials
  page.drawText('Bill of Materials', { x: margin, y, size: 13, font: bold, color: dark });
  y -= 18;

  // Table header
  const colX = { desc: margin, size: margin + 220, qty: margin + 300, price: margin + 360, install: margin + 440, total: pageW - margin };
  page.drawRectangle({ x: margin - 4, y: y - 4, width: pageW - 2 * margin + 8, height: 22, color: lightGray });
  page.drawText('Item', { x: colX.desc, y, size: 9, font: bold, color: dark });
  page.drawText('Size', { x: colX.size, y, size: 9, font: bold, color: dark });
  page.drawText('Qty', { x: colX.qty, y, size: 9, font: bold, color: dark });
  page.drawText('Price', { x: colX.price, y, size: 9, font: bold, color: dark });
  page.drawText('Install', { x: colX.install, y, size: 9, font: bold, color: dark });
  const totalHdrW = bold.widthOfTextAtSize('Total', 9);
  page.drawText('Total', { x: colX.total - totalHdrW, y, size: 9, font: bold, color: dark });
  y -= 22;

  // Rows
  for (const li of items) {
    if (y < margin + 100) {
      page = pdf.addPage([pageW, pageH]);
      y = pageH - margin;
    }
    const typeName = PRODUCT_TYPE_LABELS[li.product_type] ?? li.product_type;
    const variant = li.door_variant ? ` (${DOOR_VARIANTS[li.door_variant] ?? li.door_variant})` : '';
    const itemLabel = (li.label || typeName) + variant;
    const displayPrice = li.unit_total > 0 ? `$${Math.round(li.base_price * 1.30).toLocaleString()}` : 'TBD';
    const displayInstall = li.unit_total > 0 ? `$${Math.round(li.install_fee).toLocaleString()}` : 'TBD';
    const lineTotal = li.line_total > 0 ? `$${Math.round(li.line_total).toLocaleString()}` : 'TBD';

    // truncate long labels
    const maxLabel = 32;
    const truncLabel = itemLabel.length > maxLabel ? itemLabel.slice(0, maxLabel - 1) + '…' : itemLabel;

    page.drawText(truncLabel, { x: colX.desc, y, size: 9, font, color: dark });
    page.drawText(`${li.width}" × ${li.height}"`, { x: colX.size, y, size: 9, font, color: dark });
    page.drawText(String(li.quantity), { x: colX.qty, y, size: 9, font, color: dark });
    page.drawText(displayPrice, { x: colX.price, y, size: 9, font, color: dark });
    page.drawText(displayInstall, { x: colX.install, y, size: 9, font, color: dark });
    const ltW = bold.widthOfTextAtSize(lineTotal, 9);
    page.drawText(lineTotal, { x: colX.total - ltW, y, size: 9, font: bold, color: dark });
    y -= 18;
    page.drawLine({ start: { x: margin, y: y + 6 }, end: { x: pageW - margin, y: y + 6 }, thickness: 0.5, color: lightGray });
  }

  y -= 14;

  // Total row
  if (y < margin + 80) { page = pdf.addPage([pageW, pageH]); y = pageH - margin; }
  page.drawRectangle({ x: margin - 4, y: y - 6, width: pageW - 2 * margin + 8, height: 28, color: navy });
  page.drawText('TOTAL PROJECT COST', { x: margin, y: y + 4, size: 11, font: bold, color: rgb(1, 1, 1) });
  const totalValW = bold.widthOfTextAtSize(total, 14);
  page.drawText(total, { x: pageW - margin - totalValW, y: y + 2, size: 14, font: bold, color: amber });
  y -= 50;

  // Footer note
  const note = 'Our 5-Day Guarantee: This price is locked in for 5 business days, subject to on-site measurement verification.';
  const noteWidth = pageW - 2 * margin;
  const noteWords = note.split(' ');
  let line = '';
  for (const w of noteWords) {
    const test = line ? line + ' ' + w : w;
    if (font.widthOfTextAtSize(test, 9) > noteWidth) {
      page.drawText(line, { x: margin, y, size: 9, font, color: gray });
      y -= 14;
      line = w;
    } else {
      line = test;
    }
  }
  if (line) { page.drawText(line, { x: margin, y, size: 9, font, color: gray }); y -= 14; }

  y -= 8;
  page.drawText('Call to schedule your free expert visit: (786) 555-1234', { x: margin, y, size: 10, font: bold, color: navy });
  y -= 14;
  page.drawText('EZPZ Windows · info@ezpzwindows.com · ezpzwindows.com', { x: margin, y, size: 9, font, color: gray });

  return await pdf.save();
}

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
    const { quoteId, pdfBase64: clientPdf } = await req.json();
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
      <img src="https://ezpzwindows.com/logo.svg" alt="EZPZ Windows" style="width:48px;height:50px;margin-bottom:12px;" />
      <div style="font-size:13px;color:#93c5fd;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:8px;">EZPZ Windows</div>
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
        EZPZ Windows · South Florida's Hurricane Impact Window & Door Specialists
      </div>
    </div>
  </div>
</body>
</html>`;

    // Prefer the client-generated PDF (uses the admin layout w/ product thumbnails).
    // Fall back to the server-side pdf-lib version if the client couldn't produce one.
    let pdfBase64: string | null = clientPdf ?? null;
    if (!pdfBase64) {
      try {
        const pdfBytes = await generateQuotePdf(quote, items ?? []);
        pdfBase64 = encodeBase64(pdfBytes);
      } catch (pdfErr) {
        console.error('PDF generation failed:', pdfErr);
      }
    }

    // Send via Resend
    let resendStatus: number | null = null;
    let resendResponse: unknown = null;
    let resendOk = false;
    if (RESEND_API_KEY) {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'EZPZ Windows <info@ezpzwindows.com>',
          to: [quote.client_email],
          bcc: ['info@ezpzwindows.com'],
          reply_to: 'info@ezpzwindows.com',
          subject: `Your Hurricane Impact Quote — ${quote.quote_number}`,
          html,
          ...(pdfBase64 ? {
            attachments: [{
              filename: `${quote.quote_number}.pdf`,
              content: pdfBase64,
            }],
          } : {}),
        }),
      });
      resendStatus = r.status;
      resendOk = r.ok;
      try { resendResponse = await r.json(); } catch { resendResponse = await r.text(); }
      if (!r.ok) {
        console.error('Resend error:', resendStatus, resendResponse);
      } else {
        console.log('Resend ok:', resendResponse);
      }

      // Only mark sent on success
      if (r.ok) {
        await supabase
          .from('quotes')
          .update({ status: 'sent', email_sent_at: new Date().toISOString() })
          .eq('id', quoteId);
      }
    } else {
      console.warn('RESEND_API_KEY not set — skipping email send');
    }

    return new Response(JSON.stringify({ success: resendOk, resendStatus, resendResponse }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
