import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, RefreshCw, ChevronDown, ChevronUp, Loader2, Archive, Trash2, Download, ArchiveRestore, AlertTriangle } from 'lucide-react';

const STATUS_COLORS = {
  pending:  'bg-amber-50 text-amber-700 border-amber-200',
  sent:     'bg-accent/10 text-accent border-accent/30',
  viewed:   'bg-violet-50 text-violet-700 border-violet-200',
  accepted: 'bg-success/10 text-success border-success/30',
  expired:  'bg-slate-100 text-muted border-border',
  archived: 'bg-slate-100 text-muted border-border',
};

const PRODUCT_TYPE_LABELS = {
  single_hung: 'Single Hung Window',
  horizontal_roller_xo: 'Horizontal Roller XO',
  horizontal_roller_xox: 'Horizontal Roller XOX',
  half_moon: 'Half Moon Window',
  circle: 'Circle Window',
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

const DOOR_VARIANTS = {
  traditional: 'Traditional',
  design: 'Design',
  wg_traditional: 'Wood Grain Traditional',
  wg_design: 'Wood Grain Design',
};

const GLASS_TYPES = {
  clear: 'Clear',
  tint: 'Tint',
  lowe_366: 'Lowe-366',
  frosted: 'Frosted',
};

const CATEGORY_LABELS = {
  window: 'Window',
  door: 'Door',
  sliding_door: 'Sliding Door',
};

function formatItemDetails(li) {
  const parts = [];
  if (li.door_variant) parts.push(DOOR_VARIANTS[li.door_variant] || li.door_variant);
  if (li.glass_type) parts.push(GLASS_TYPES[li.glass_type] || li.glass_type);
  return parts.join(' · ');
}

function formatSize(li) {
  if (li.product_type === 'circle') return `${li.width}" diameter`;
  if (li.product_type === 'half_moon') return `${li.width}" W + ${li.height}" H`;
  return `${li.width}" × ${li.height}"`;
}

function generatePDF(quote, quoteItems) {
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const expiryDate = new Date(quote.created_at);
  expiryDate.setDate(expiryDate.getDate() + 5);

  const itemRows = (quoteItems || []).map((li, i) => {
    const typeName = PRODUCT_TYPE_LABELS[li.product_type] || li.product_type;
    const category = CATEGORY_LABELS[li.item_category] || li.item_category;
    const details = formatItemDetails(li);
    const size = formatSize(li);
    const displayPrice = li.unit_total > 0 ? `$${Math.round(li.base_price * 1.30).toLocaleString()}` : 'TBD';
    const displayInstall = li.unit_total > 0 ? `$${Math.round(li.install_fee).toLocaleString()}` : 'TBD';
    const lineTotal = li.line_total > 0 ? `$${Math.round(li.line_total).toLocaleString()}` : 'TBD';
    return `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;">${i + 1}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;">
          ${li.label ? `<div style="font-size:11px;color:#6b7280;"><strong>Label:</strong> ${li.label}</div>` : ''}
          <div style="font-weight:600;">${typeName}</div>
          ${details ? `<div style="font-size:11px;color:#6b7280;">${details}</div>` : ''}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;text-align:center;">${size}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;text-align:center;">${li.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;text-align:right;">${displayPrice}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;text-align:right;">${displayInstall}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;text-align:right;font-weight:600;">${lineTotal}</td>
      </tr>`;
  }).join('');

  const totalDisplay = quote.total > 0 ? `$${Math.round(quote.total).toLocaleString()}` : 'Custom Quote';

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Quote ${quote.quote_number}</title>
<style>
  @media print { body { margin: 0; } @page { margin: 0.5in; } }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; margin: 0; padding: 24px; }
  .header { background: linear-gradient(135deg, #0f2942, #1a3d5c); color: white; padding: 32px; border-radius: 12px; margin-bottom: 24px; }
  .header h1 { margin: 0 0 4px; font-size: 22px; }
  .header .brand { font-size: 11px; color: #93c5fd; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
  .header .quote-num { font-size: 13px; color: #93c5fd; }
  .header .total { font-size: 32px; font-weight: 800; color: #0ea5e9; }
  .header .total-label { font-size: 11px; color: #93c5fd; }
  .section { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 16px; }
  .section h2 { margin: 0 0 12px; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; }
  .info-grid .label { color: #9ca3af; font-size: 11px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f9fafb; padding: 8px 12px; text-align: left; font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
  .total-row { text-align: right; font-size: 18px; font-weight: 700; color: #0f2942; padding-top: 12px; }
  .guarantee { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; font-size: 12px; color: #92400e; margin-bottom: 16px; }
  .footer { text-align: center; font-size: 11px; color: #9ca3af; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
</style>
</head>
<body>
  <div class="header">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <div class="brand">Doors Plus + USA</div>
        <h1>Guaranteed Quote</h1>
        <div class="quote-num">${quote.quote_number}</div>
      </div>
      <div style="text-align:right;">
        <div class="total">${totalDisplay}</div>
        <div class="total-label">Total Project Cost</div>
      </div>
    </div>
    <div style="margin-top:16px;font-size:12px;color:#93c5fd;">
      Issued: ${fmtDate(quote.created_at)} · Valid until: ${fmtDate(expiryDate)}
    </div>
  </div>

  <div class="section">
    <h2>Project Details</h2>
    <div class="info-grid">
      <div><div class="label">Client</div>${quote.client_first_name} ${quote.client_last_name}</div>
      <div><div class="label">Email</div>${quote.client_email}</div>
      <div><div class="label">Phone</div>${quote.client_phone || '—'}</div>
      <div><div class="label">Property</div>${quote.client_address || ''}${quote.client_city ? `, ${quote.client_city}` : ''} ${quote.client_zip || ''}</div>
      <div><div class="label">Project Type</div><span style="text-transform:capitalize">${quote.project_type || '—'}</span></div>
      <div><div class="label">Measurement</div><span style="text-transform:capitalize">${quote.measure_from || '—'}</span></div>
    </div>
  </div>

  <div class="section">
    <h2>Bill of Materials</h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Item</th>
          <th style="text-align:center;">Size</th>
          <th style="text-align:center;">Qty</th>
          <th style="text-align:right;">Price</th>
          <th style="text-align:right;">Install</th>
          <th style="text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>
    ${quote.total > 0 ? `<div class="total-row">Total: ${totalDisplay}</div>` : ''}
  </div>

  <div class="guarantee">
    <strong>5-Day Price Guarantee</strong> — This quote is guaranteed until ${fmtDate(expiryDate)},
    subject to on-site measurement verification. Final pricing confirmed after the complimentary expert visit.
  </div>

  <div class="footer">
    <div style="font-weight:600;color:#0f2942;margin-bottom:4px;">Doors Plus + USA</div>
    South Florida's Hurricane Impact Window & Door Specialists · (786) 555-1234
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };
}

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [items, setItems] = useState({});
  const [showArchived, setShowArchived] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    setQuotes(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const loadItems = async (quoteId) => {
    if (items[quoteId]) return;
    const { data } = await supabase.from('quote_items').select('*').eq('quote_id', quoteId).order('sort_order');
    setItems((prev) => ({ ...prev, [quoteId]: data ?? [] }));
  };

  const toggleExpand = async (id) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    await loadItems(id);
  };

  const updateStatus = async (id, status) => {
    await supabase.from('quotes').update({ status }).eq('id', id);
    setQuotes((prev) => prev.map((q) => q.id === id ? { ...q, status } : q));
  };

  const archiveQuote = async (id) => {
    await supabase.from('quotes').update({ status: 'archived' }).eq('id', id);
    setQuotes((prev) => prev.map((q) => q.id === id ? { ...q, status: 'archived' } : q));
    setExpanded(null);
  };

  const restoreQuote = async (id) => {
    await supabase.from('quotes').update({ status: 'pending' }).eq('id', id);
    setQuotes((prev) => prev.map((q) => q.id === id ? { ...q, status: 'pending' } : q));
  };

  const deleteQuote = async (id) => {
    await supabase.from('quote_items').delete().eq('quote_id', id);
    await supabase.from('quotes').delete().eq('id', id);
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    setExpanded(null);
    setConfirmDelete(null);
  };

  const downloadPDF = async (q) => {
    await loadItems(q.id);
    // Small delay to ensure items are loaded
    setTimeout(() => {
      const quoteItems = items[q.id];
      if (quoteItems) {
        generatePDF(q, quoteItems);
      }
    }, 100);
  };

  // Need a ref-based approach for PDF since items may load async
  const downloadPDFDirect = async (q) => {
    let quoteItems = items[q.id];
    if (!quoteItems) {
      const { data } = await supabase.from('quote_items').select('*').eq('quote_id', q.id).order('sort_order');
      quoteItems = data ?? [];
      setItems((prev) => ({ ...prev, [q.id]: quoteItems }));
    }
    generatePDF(q, quoteItems);
  };

  const activeQuotes = quotes.filter((q) => q.status !== 'archived');
  const archivedQuotes = quotes.filter((q) => q.status === 'archived');
  const displayQuotes = showArchived ? archivedQuotes : activeQuotes;

  const filtered = displayQuotes.filter((q) => {
    const s = search.toLowerCase();
    return (
      q.quote_number?.toLowerCase().includes(s) ||
      q.client_email?.toLowerCase().includes(s) ||
      `${q.client_first_name} ${q.client_last_name}`.toLowerCase().includes(s)
    );
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-primary">Quotes</h1>
          <p className="text-muted text-xs">
            {showArchived
              ? `${archivedQuotes.length} archived`
              : `${activeQuotes.length} active quotes`
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
              showArchived
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-muted border-border hover:border-slate-400'
            }`}
          >
            <Archive className="w-3.5 h-3.5" strokeWidth={1.5} />
            {showArchived ? 'View Active' : `Archive (${archivedQuotes.length})`}
          </button>
          <button onClick={load} className="flex items-center gap-2 text-xs text-muted hover:text-primary cursor-pointer transition-colors">
            <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} /> Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Search by name, email, or quote number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:border-accent outline-none transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-accent animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted text-sm">
          {showArchived ? 'No archived quotes.' : 'No quotes found.'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((q) => (
            <div key={q.id} className="bg-white border border-border rounded-lg overflow-hidden">
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleExpand(q.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-sm font-semibold text-primary">{q.quote_number}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border capitalize ${STATUS_COLORS[q.status] ?? 'bg-slate-100 text-muted border-border'}`}>
                      {q.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {q.client_first_name} {q.client_last_name} · {q.client_email}
                  </div>
                  <div className="text-[10px] text-muted mt-0.5">
                    {new Date(q.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {q.client_city ? ` · ${q.client_city}` : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-accent">
                    {q.total > 0 ? `$${Math.round(q.total).toLocaleString()}` : 'TBD'}
                  </div>
                  <div className="text-[10px] text-muted capitalize">{q.project_type}</div>
                </div>
                {expanded === q.id ? <ChevronUp className="w-4 h-4 text-muted" strokeWidth={1.5} /> : <ChevronDown className="w-4 h-4 text-muted" strokeWidth={1.5} />}
              </div>

              {/* Expanded detail */}
              {expanded === q.id && (
                <div className="border-t border-border p-4 bg-slate-50 space-y-4">
                  {/* Client info */}
                  <div className="grid sm:grid-cols-3 gap-3 text-sm">
                    <div><span className="text-muted block text-[10px] uppercase tracking-wide">Phone</span>{q.client_phone || '\u2014'}</div>
                    <div><span className="text-muted block text-[10px] uppercase tracking-wide">Address</span>{q.client_address || '\u2014'}, {q.client_city} {q.client_zip}</div>
                    <div><span className="text-muted block text-[10px] uppercase tracking-wide">Measurement</span>{q.measure_from}</div>
                  </div>

                  {/* Internal note — price list */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
                    <span className="font-semibold">Internal:</span> Price list used — {q.price_list_name || 'Unknown'}
                  </div>

                  {/* Items */}
                  <div>
                    <div className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-2">Items</div>
                    {items[q.id] ? (
                      <table className="w-full text-xs bg-white rounded-lg overflow-hidden">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="px-3 py-2 text-left text-[10px] font-semibold text-muted uppercase tracking-wide">#</th>
                            <th className="px-3 py-2 text-left text-[10px] font-semibold text-muted uppercase tracking-wide">Item</th>
                            <th className="px-3 py-2 text-left text-[10px] font-semibold text-muted uppercase tracking-wide">Size</th>
                            <th className="px-3 py-2 text-center text-[10px] font-semibold text-muted uppercase tracking-wide">Qty</th>
                            <th className="px-3 py-2 text-right text-[10px] font-semibold text-muted uppercase tracking-wide">Base</th>
                            <th className="px-3 py-2 text-right text-[10px] font-semibold text-muted uppercase tracking-wide">Install</th>
                            <th className="px-3 py-2 text-right text-[10px] font-semibold text-muted uppercase tracking-wide">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items[q.id].map((li, idx) => {
                            const typeName = PRODUCT_TYPE_LABELS[li.product_type] || li.product_type;
                            const details = formatItemDetails(li);
                            const size = formatSize(li);
                            return (
                              <tr key={li.id} className="border-t border-border">
                                <td className="px-3 py-2 text-muted">{idx + 1}</td>
                                <td className="px-3 py-2">
                                  {li.label && <div className="text-[10px] text-muted"><span className="font-semibold">Label:</span> {li.label}</div>}
                                  <div className="text-primary font-medium">{typeName}</div>
                                  {details && <div className="text-muted text-[10px]">{details}</div>}
                                </td>
                                <td className="px-3 py-2 text-slate-600">{size}</td>
                                <td className="px-3 py-2 text-center text-slate-600">{li.quantity}</td>
                                <td className="px-3 py-2 text-right text-slate-600">${li.base_price?.toLocaleString()}</td>
                                <td className="px-3 py-2 text-right text-slate-600">${li.install_fee?.toLocaleString()}</td>
                                <td className="px-3 py-2 text-right font-semibold text-primary">${Math.round(li.line_total).toLocaleString()}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-muted text-xs">Loading items...</div>
                    )}
                  </div>

                  {/* Financials */}
                  <div className="flex gap-4 text-sm">
                    <div><span className="text-muted text-[10px] block uppercase tracking-wide">Subtotal</span>${Math.round(q.items_subtotal).toLocaleString()}</div>
                    <div><span className="text-muted text-[10px] block uppercase tracking-wide">Markup (30%)</span>${Math.round(q.markup_amount).toLocaleString()}</div>
                    <div><span className="text-muted text-[10px] block uppercase tracking-wide">Total</span><span className="font-semibold text-accent">${Math.round(q.total).toLocaleString()}</span></div>
                  </div>

                  {/* Status change — only for active quotes */}
                  {q.status !== 'archived' && (
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[10px] text-muted uppercase tracking-wide">Change status:</span>
                      {['pending','sent','viewed','accepted','expired'].map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(q.id, s)}
                          className={`text-[10px] px-3 py-1 rounded-full border font-semibold cursor-pointer transition-colors capitalize ${
                            q.status === s
                              ? STATUS_COLORS[s]
                              : 'bg-white border-border text-muted hover:border-slate-400'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    {/* PDF Download */}
                    <button
                      onClick={() => downloadPDFDirect(q)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 cursor-pointer transition-colors font-medium"
                    >
                      <Download className="w-3.5 h-3.5" strokeWidth={1.5} /> Download PDF
                    </button>

                    {/* Archive / Restore */}
                    {q.status === 'archived' ? (
                      <button
                        onClick={() => restoreQuote(q.id)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 cursor-pointer transition-colors font-medium"
                      >
                        <ArchiveRestore className="w-3.5 h-3.5" strokeWidth={1.5} /> Restore
                      </button>
                    ) : (
                      <button
                        onClick={() => archiveQuote(q.id)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-muted hover:bg-slate-200 cursor-pointer transition-colors font-medium"
                      >
                        <Archive className="w-3.5 h-3.5" strokeWidth={1.5} /> Archive
                      </button>
                    )}

                    {/* Delete */}
                    {confirmDelete === q.id ? (
                      <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs text-danger flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} /> Delete permanently?
                        </span>
                        <button
                          onClick={() => deleteQuote(q.id)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-danger text-white hover:bg-red-700 cursor-pointer transition-colors font-medium"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-muted hover:bg-slate-200 cursor-pointer transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(q.id)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-danger/60 hover:bg-danger/10 hover:text-danger cursor-pointer transition-colors font-medium ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} /> Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
