// Shared HTML template for quote PDFs.
// Used by the admin print-to-PDF popup AND the client-side PDF attachment generator.

const PRODUCT_TYPE_LABELS = {
  single_hung: 'Single Hung Window',
  horizontal_roller_xo: 'Horizontal Roller XO',
  horizontal_roller_xox: 'Horizontal Roller XOX',
  half_moon: 'Half Moon Window',
  circle: 'Circle Window',
  special_shape: 'Special Shape Window',
  geometric: 'Geometric Window',
  single_door: 'Single Door',
  bermuda_door: 'Bermuda Door',
  double_door: 'Double Door',
  picture_window: 'Picture Window',
  side_light: 'Side Light',
  sgd_2_panel: '2-Panel Sliding Door',
  sgd_3_panel: '3-Panel Sliding Door',
  sgd_4_panel: '4-Panel Sliding Door',
};

const DOOR_VARIANT_LABELS = {
  traditional: 'Traditional',
  design: 'Design',
  wg_traditional: 'Wood Grain Traditional',
  wg_design: 'Wood Grain Design',
};

const GLASS_TYPE_LABELS = {
  clear: 'Clear',
  tint: 'Tint',
  lowe_366: 'Lowe-366',
  frosted: 'Frosted',
};

export const THUMB_SLUGS = {
  single_hung: 'single-hung',
  horizontal_roller_xo: 'horizontal-roller-xo',
  horizontal_roller_xox: 'horizontal-roller-xox',
  half_moon: 'half-moon',
  circle: 'circle',
  single_door: 'single-door',
  double_door: 'double-door',
  bermuda_door: 'bermuda-door',
  picture_window: 'picture-window',
  side_light: 'side-light',
  sgd_2_panel: 'sgd-2-panel',
  sgd_3_panel: 'sgd-3-panel',
  sgd_4_panel: 'sgd-4-panel',
};

function formatItemDetails(li) {
  const parts = [];
  if (li.door_variant) parts.push(DOOR_VARIANT_LABELS[li.door_variant] || li.door_variant);
  if (li.glass_type) parts.push(GLASS_TYPE_LABELS[li.glass_type] || li.glass_type);
  return parts.join(' · ');
}

function formatSize(li) {
  if (li.product_type === 'circle') return `${li.width}" diameter`;
  if (li.product_type === 'half_moon') return `${li.width}" W + ${li.height}" H`;
  return `${li.width}" × ${li.height}"`;
}

// When `origin` is provided, build absolute URLs for <img src>; otherwise no thumb.
// When `thumbsMap` is provided (slug → data URI), use inline data URIs instead
// (needed for html2canvas rendering inside srcdoc iframes where cross-origin
// images won't load).
function getThumbUrl(productType, origin, thumbsMap) {
  const slug = THUMB_SLUGS[productType];
  if (!slug) return '';
  if (thumbsMap && thumbsMap[slug]) return thumbsMap[slug];
  if (!origin) return '';
  return `${origin}/types/${slug}.svg`;
}

// Raw SVG markup for the brand logo — kept in sync with public/logo.svg.
// Exported so callers can rasterize it to PNG before injection (html2canvas
// reliably renders PNG data URIs but not SVG data URIs).
export const LOGO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 44" fill="none">' +
    '<path d="M20 2 L36 10 L36 24 C36 32 28 40 20 42 C12 40 4 32 4 24 L4 10 Z" stroke="#0284c7" stroke-width="2.5" fill="#0284c7" fill-opacity="0.08"/>' +
    '<rect x="13" y="12" width="14" height="22" rx="2" stroke="#0284c7" stroke-width="2" fill="none"/>' +
    '<rect x="15.5" y="14.5" width="9" height="8" rx="1" fill="#0284c7" fill-opacity="0.15" stroke="#0284c7" stroke-width="1"/>' +
    '<rect x="15.5" y="25" width="9" height="6.5" rx="1" fill="#0284c7" fill-opacity="0.15" stroke="#0284c7" stroke-width="1"/>' +
    '<circle cx="24" cy="25" r="1.2" fill="#0284c7"/>' +
    '<circle cx="33" cy="8" r="8" fill="#0284c7"/>' +
    '<circle cx="33" cy="8" r="6" fill="#ffffff"/>' +
    '<rect x="29.5" y="6.75" width="7" height="2.5" rx="0.8" fill="#f59e0b"/>' +
    '<rect x="31.75" y="4.5" width="2.5" height="7" rx="0.8" fill="#f59e0b"/>' +
  '</svg>';

// Fallback SVG data URI — only used when caller doesn't pass a rasterized logo.
// Renders correctly in print-from-browser but unreliably in html2canvas PDFs.
const LOGO_SVG_DATA_URI = `data:image/svg+xml,${encodeURIComponent(LOGO_SVG)}`;

/**
 * Build the full HTML document for a quote PDF.
 * @param {object} quote - quote record (fields: quote_number, client_*, total, created_at, project_type, measure_from)
 * @param {array}  items - quote items
 * @param {string} origin - origin for absolute asset URLs (optional; omit for no thumbnails)
 * @param {object} thumbsMap - optional map of slug -> data URI (inline SVGs)
 * @param {string} logoDataUri - optional rasterized PNG data URI for the header brand logo. Recommended when rendering via html2canvas; if omitted, falls back to inline SVG which renders fine in print-from-browser but may fail under html2canvas.
 * @returns {string} HTML
 */
export function buildQuotePdfHtml(quote, items, origin = '', thumbsMap = null, logoDataUri = null) {
  const headerLogoSrc = logoDataUri || LOGO_SVG_DATA_URI;
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const expiryDate = new Date(quote.created_at);
  expiryDate.setDate(expiryDate.getDate() + 5);

  const itemRows = (items || []).map((li, i) => {
    const typeName = PRODUCT_TYPE_LABELS[li.product_type] || li.product_type;
    const details = formatItemDetails(li);
    const size = formatSize(li);
    const thumbUrl = getThumbUrl(li.product_type, origin, thumbsMap);
    const displayPrice = li.unit_total > 0 ? `$${Math.round(li.base_price * 1.30).toLocaleString()}` : 'TBD';
    const displayInstall = li.unit_total > 0 ? `$${Math.round(li.install_fee).toLocaleString()}` : 'TBD';
    const lineTotal = li.line_total > 0 ? `$${Math.round(li.line_total).toLocaleString()}` : 'TBD';
    return `
      <tr style="page-break-inside:avoid;break-inside:avoid;">
        <td>${i + 1}</td>
        <td class="item-cell">
          <table class="layout"><tr>
            ${thumbUrl ? `<td style="width:36px;vertical-align:middle;"><img src="${thumbUrl}" class="item-thumb" /></td>` : ''}
            <td style="vertical-align:middle;${thumbUrl ? 'padding-left:8px;' : ''}">
              ${li.label ? `<div class="item-detail"><strong>Label:</strong> ${li.label}</div>` : ''}
              <div class="item-name">${typeName}</div>
              ${details ? `<div class="item-detail">${details}</div>` : ''}
            </td>
          </tr></table>
        </td>
        <td style="text-align:center;">${size}</td>
        <td style="text-align:center;">${li.quantity}</td>
        <td style="text-align:right;">${displayPrice}</td>
        <td style="text-align:right;">${displayInstall}</td>
        <td style="text-align:right;font-weight:600;">${lineTotal}</td>
      </tr>`;
  }).join('');

  const totalDisplay = quote.total > 0 ? `$${Math.round(quote.total).toLocaleString()}` : 'Custom Quote';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Quote ${quote.quote_number}</title>
<style>
  * { box-sizing: border-box; }
  @page { margin: 0.6in 0.5in; }
  @media print {
    body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-break { page-break-inside: avoid; break-inside: avoid; }
    tr { page-break-inside: avoid; break-inside: avoid; }
    thead { display: table-header-group; }
    .guarantee { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; margin: 0; padding: 32px; font-size: 13px; line-height: 1.5; }
  .header { background: #0f2942; background-color: #0f2942; color: white; padding: 28px 32px; border-radius: 10px; margin-bottom: 20px; }
  table.layout { width: 100%; border-collapse: collapse; }
  table.layout td { vertical-align: top; padding: 0; }
  .section { border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px 20px; margin-bottom: 14px; }
  .section h2 { margin: 0 0 10px; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; }
  table.items { width: 100%; border-collapse: collapse; }
  table.items th { background: #f8fafc; padding: 8px 10px; text-align: left; font-size: 9px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; border-bottom: 2px solid #e2e8f0; }
  table.items td { padding: 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; vertical-align: middle; }
  table.items tr:last-child td { border-bottom: none; }
  .item-cell { vertical-align: middle; }
  .item-thumb { width: 32px; height: 32px; vertical-align: middle; margin-right: 8px; }
  .item-name { font-weight: 600; font-size: 12px; }
  .item-detail { font-size: 10px; color: #6b7280; margin-top: 1px; }
  .total-row { text-align: right; font-size: 16px; font-weight: 700; color: #0f2942; padding: 14px 10px 4px; border-top: 2px solid #e2e8f0; margin-top: 8px; }
  .guarantee { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 18px; font-size: 11px; color: #92400e; margin-bottom: 14px; line-height: 1.6; }
  .footer { text-align: center; font-size: 10px; color: #9ca3af; margin-top: 20px; padding-top: 14px; border-top: 1px solid #e5e7eb; }
  .info-table { width: 100%; border-collapse: collapse; }
  .info-table td { padding: 3px 0; font-size: 12px; }
  .info-label { color: #9ca3af; font-size: 10px; width: 90px; vertical-align: top; }
</style>
</head>
<body>
  <div class="header no-break" style="background:#0f2942;background-color:#0f2942;color:#ffffff;padding:28px 32px;border-radius:10px;margin-bottom:20px;">
    <table class="layout" style="width:100%;">
      <tr>
        <td style="width:60%;">
          <table class="layout"><tr>
            <td style="width:42px;vertical-align:middle;"><img src="${headerLogoSrc}" alt="EZPZ Windows" style="width:36px;height:38px;display:block;" /></td>
            <td style="vertical-align:middle;padding-left:10px;">
              <div style="font-size:15px;font-weight:700;color:#fff;">EZPZ Windows</div>
              <div style="font-size:8px;color:#93c5fd;text-transform:uppercase;letter-spacing:0.08em;">Hurricane Impact Windows & Doors</div>
            </td>
          </tr></table>
          <div style="margin-top:14px;font-size:20px;font-weight:700;color:#fff;">Guaranteed Quote</div>
          <div style="font-size:12px;color:#93c5fd;margin-top:2px;">${quote.quote_number}</div>
        </td>
        <td style="width:40%;text-align:right;vertical-align:top;">
          <div style="font-size:28px;font-weight:800;color:#0ea5e9;line-height:1.1;">${totalDisplay}</div>
          <div style="font-size:10px;color:#93c5fd;margin-top:4px;">Total Project Cost</div>
        </td>
      </tr>
    </table>
    <div style="margin-top:12px;font-size:11px;color:#93c5fd;">
      Issued: ${fmtDate(quote.created_at)} &nbsp;·&nbsp; Valid until: ${fmtDate(expiryDate)}
    </div>
  </div>

  <div class="section no-break" style="border:1px solid #e2e8f0;border-radius:8px;padding:18px 20px;margin-bottom:14px;background:#ffffff;">
    <h2 style="margin:0 0 10px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">Project Details</h2>
    <table class="layout" style="width:100%;">
      <tr>
        <td style="width:50%;vertical-align:top;">
          <table class="info-table">
            <tr><td class="info-label">Client</td><td style="font-weight:600;">${quote.client_first_name} ${quote.client_last_name}</td></tr>
            <tr><td class="info-label">Email</td><td>${quote.client_email}</td></tr>
            <tr><td class="info-label">Phone</td><td>${quote.client_phone || '—'}</td></tr>
          </table>
        </td>
        <td style="width:50%;vertical-align:top;">
          <table class="info-table">
            <tr><td class="info-label">Property</td><td>${quote.client_address || ''}${quote.client_city ? `, ${quote.client_city}` : ''} ${quote.client_zip || ''}</td></tr>
            <tr><td class="info-label">Project</td><td style="text-transform:capitalize;">${quote.project_type || '—'}</td></tr>
            <tr><td class="info-label">Measured</td><td style="text-transform:capitalize;">${quote.measure_from || '—'}</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </div>

  <div class="section" style="border:1px solid #e2e8f0;border-radius:8px;padding:18px 20px;margin-bottom:14px;background:#ffffff;">
    <h2 style="margin:0 0 10px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">Bill of Materials</h2>
    <table class="items">
      <thead>
        <tr>
          <th style="width:24px;">#</th>
          <th>Item</th>
          <th style="text-align:center;width:90px;">Size</th>
          <th style="text-align:center;width:36px;">Qty</th>
          <th style="text-align:right;width:70px;">Price</th>
          <th style="text-align:right;width:70px;">Install</th>
          <th style="text-align:right;width:70px;">Total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>
    ${quote.total > 0 ? `<div class="total-row">Total: ${totalDisplay}</div>` : ''}
  </div>

  <div class="guarantee no-break" style="background:#fffbeb;background-color:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;font-size:11px;color:#92400e;margin-bottom:14px;line-height:1.6;">
    <strong>5-Day Price Guarantee</strong> — This quote is guaranteed until ${fmtDate(expiryDate)},
    subject to on-site measurement verification. Final pricing confirmed after the complimentary expert visit.
  </div>

  <div class="footer no-break">
    <div style="font-weight:600;color:#0f2942;margin-bottom:3px;">EZPZ Windows</div>
    South Florida's Hurricane Impact Window & Door Specialists · (786) 555-1234
  </div>
</body>
</html>`;
}
