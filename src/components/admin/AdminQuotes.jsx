import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, RefreshCw, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

const STATUS_COLORS = {
  pending:  'bg-amber-50 text-amber-700 border-amber-200',
  sent:     'bg-accent/10 text-accent border-accent/30',
  viewed:   'bg-violet-50 text-violet-700 border-violet-200',
  accepted: 'bg-success/10 text-success border-success/30',
  expired:  'bg-slate-100 text-muted border-border',
};

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [items, setItems] = useState({});

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

  const filtered = quotes.filter((q) => {
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
          <p className="text-muted text-xs">{quotes.length} total quotes</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-xs text-muted hover:text-primary cursor-pointer transition-colors">
          <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} /> Refresh
        </button>
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
        <div className="text-center py-16 text-muted text-sm">No quotes found.</div>
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

                  {/* Items */}
                  <div>
                    <div className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-2">Items</div>
                    {items[q.id] ? (
                      <table className="w-full text-xs bg-white rounded-lg overflow-hidden">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="px-3 py-2 text-left text-[10px] font-semibold text-muted uppercase tracking-wide">Item</th>
                            <th className="px-3 py-2 text-left text-[10px] font-semibold text-muted uppercase tracking-wide">Size</th>
                            <th className="px-3 py-2 text-center text-[10px] font-semibold text-muted uppercase tracking-wide">Qty</th>
                            <th className="px-3 py-2 text-right text-[10px] font-semibold text-muted uppercase tracking-wide">Base</th>
                            <th className="px-3 py-2 text-right text-[10px] font-semibold text-muted uppercase tracking-wide">Install</th>
                            <th className="px-3 py-2 text-right text-[10px] font-semibold text-muted uppercase tracking-wide">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items[q.id].map((li) => (
                            <tr key={li.id} className="border-t border-border">
                              <td className="px-3 py-2">
                                <div className="text-primary">{li.label || li.product_type}</div>
                                {li.door_variant && <div className="text-muted">{li.door_variant}</div>}
                              </td>
                              <td className="px-3 py-2 text-slate-600">{li.width}" x {li.height}"</td>
                              <td className="px-3 py-2 text-center text-slate-600">{li.quantity}</td>
                              <td className="px-3 py-2 text-right text-slate-600">${li.base_price?.toLocaleString()}</td>
                              <td className="px-3 py-2 text-right text-slate-600">${li.install_fee?.toLocaleString()}</td>
                              <td className="px-3 py-2 text-right font-semibold text-primary">${Math.round(li.line_total).toLocaleString()}</td>
                            </tr>
                          ))}
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

                  {/* Status change */}
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
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
