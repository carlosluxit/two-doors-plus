import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, RefreshCw, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

const STATUS_COLORS = {
  pending:  'bg-yellow-100 text-yellow-800',
  sent:     'bg-blue-100 text-blue-800',
  viewed:   'bg-purple-100 text-purple-800',
  accepted: 'bg-green-100 text-green-800',
  expired:  'bg-gray-100 text-gray-600',
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
          <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
          <p className="text-gray-500 text-sm">{quotes.length} total quotes</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary cursor-pointer">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, or quote number…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary outline-none"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No quotes found.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((q) => (
            <div key={q.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(q.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-sm font-bold text-gray-900">{q.quote_number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[q.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {q.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-0.5">
                    {q.client_first_name} {q.client_last_name} · {q.client_email}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {new Date(q.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {q.client_city ? ` · ${q.client_city}` : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    {q.total > 0 ? `$${Math.round(q.total).toLocaleString()}` : 'TBD'}
                  </div>
                  <div className="text-xs text-gray-400 capitalize">{q.project_type}</div>
                </div>
                {expanded === q.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>

              {/* Expanded detail */}
              {expanded === q.id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
                  {/* Client info */}
                  <div className="grid sm:grid-cols-3 gap-3 text-sm">
                    <div><span className="text-gray-400 block text-xs">Phone</span>{q.client_phone || '—'}</div>
                    <div><span className="text-gray-400 block text-xs">Address</span>{q.client_address || '—'}, {q.client_city} {q.client_zip}</div>
                    <div><span className="text-gray-400 block text-xs">Measurement</span>{q.measure_from}</div>
                  </div>

                  {/* Items */}
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Items</div>
                    {items[q.id] ? (
                      <table className="w-full text-xs bg-white rounded-lg overflow-hidden">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-3 py-2 text-left">Item</th>
                            <th className="px-3 py-2 text-left">Size</th>
                            <th className="px-3 py-2 text-center">Qty</th>
                            <th className="px-3 py-2 text-right">Base</th>
                            <th className="px-3 py-2 text-right">Install</th>
                            <th className="px-3 py-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items[q.id].map((li) => (
                            <tr key={li.id} className="border-t border-gray-100">
                              <td className="px-3 py-2">
                                <div>{li.label || li.product_type}</div>
                                {li.door_variant && <div className="text-gray-400">{li.door_variant}</div>}
                              </td>
                              <td className="px-3 py-2">{li.width}" × {li.height}"</td>
                              <td className="px-3 py-2 text-center">{li.quantity}</td>
                              <td className="px-3 py-2 text-right">${li.base_price?.toLocaleString()}</td>
                              <td className="px-3 py-2 text-right">${li.install_fee?.toLocaleString()}</td>
                              <td className="px-3 py-2 text-right font-semibold">${Math.round(li.line_total).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-gray-400 text-xs">Loading items…</div>
                    )}
                  </div>

                  {/* Financials */}
                  <div className="flex gap-4 text-sm">
                    <div><span className="text-gray-400 text-xs block">Subtotal</span>${Math.round(q.items_subtotal).toLocaleString()}</div>
                    <div><span className="text-gray-400 text-xs block">Markup (30%)</span>${Math.round(q.markup_amount).toLocaleString()}</div>
                    <div><span className="text-gray-400 text-xs block">Total</span><span className="font-bold text-primary">${Math.round(q.total).toLocaleString()}</span></div>
                  </div>

                  {/* Status change */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">Change status:</span>
                    {['pending','sent','viewed','accepted','expired'].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(q.id, s)}
                        className={`text-xs px-3 py-1 rounded-full border font-semibold cursor-pointer transition-colors ${
                          q.status === s
                            ? STATUS_COLORS[s] + ' border-transparent'
                            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'
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
