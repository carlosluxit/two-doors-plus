import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Check, Loader2, RefreshCw, ChevronDown, ChevronUp, Save, AlertCircle } from 'lucide-react';

const CATEGORIES = ['window', 'door', 'sliding_door'];
const PRODUCT_TYPE_LABELS = {
  single_hung: 'Single Hung',
  horizontal_roller_xo: 'Horizontal Roller XO',
  horizontal_roller_xox: 'Horizontal Roller XOX',
  geometric: 'Geometric Shapes',
  single_door: 'Single Door',
  bermuda_door: 'Bermuda Door',
  double_door: 'Double Door',
  picture_window: 'Picture Window',
  side_light: 'Side Light',
  sgd_2_panel: '2-Panel SGD',
  sgd_3_panel: '3-Panel XOX',
  sgd_4_panel: '4-Panel XOOX',
};

export default function AdminPriceLists() {
  const [lists, setLists] = useState([]);
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [expandedCat, setExpandedCat] = useState('window');
  const [activating, setActivating] = useState(null);
  const [saving, setSaving] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [newListName, setNewListName] = useState('');
  const [creatingList, setCreatingList] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('price_lists').select('*').order('created_at', { ascending: false });
    setLists(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const loadEntries = async (listId) => {
    if (entries[listId]) return;
    const { data } = await supabase.from('price_entries').select('*').eq('price_list_id', listId).order('product_category').order('width_min');
    setEntries((prev) => ({ ...prev, [listId]: data ?? [] }));
  };

  const toggleExpand = async (id) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    await loadEntries(id);
  };

  const activateList = async (id) => {
    setActivating(id);
    await supabase.from('price_lists').update({ is_active: false }).neq('id', 'none');
    await supabase.from('price_lists').update({ is_active: true }).eq('id', id);
    await load();
    setActivating(null);
  };

  const updateEntry = (listId, entryId, field, value) => {
    setEntries((prev) => ({
      ...prev,
      [listId]: prev[listId].map((e) =>
        e.id === entryId ? { ...e, [field]: value === '' ? null : Number(value) } : e
      ),
    }));
  };

  const saveEntry = async (listId, entry) => {
    setSaving((prev) => ({ ...prev, [entry.id]: true }));
    setSaveError(null);
    const { error } = await supabase
      .from('price_entries')
      .update({
        base_price: entry.base_price,
        price_traditional: entry.price_traditional,
        price_design: entry.price_design,
        price_wg_traditional: entry.price_wg_traditional,
        price_wg_design: entry.price_wg_design,
        install_fee: entry.install_fee,
      })
      .eq('id', entry.id);
    if (error) setSaveError(error.message);
    setSaving((prev) => ({ ...prev, [entry.id]: false }));
  };

  const createNewList = async () => {
    if (!newListName.trim()) return;
    setCreatingList(true);
    const { data: activeList } = await supabase.from('price_lists').select('id').eq('is_active', true).maybeSingle();

    const { data: newList, error } = await supabase
      .from('price_lists')
      .insert({ name: newListName.trim(), is_active: false })
      .select()
      .single();

    if (error || !newList) { setCreatingList(false); return; }

    if (activeList) {
      const { data: sourceEntries } = await supabase.from('price_entries').select('*').eq('price_list_id', activeList.id);
      if (sourceEntries?.length) {
        const cloned = sourceEntries.map(({ id, created_at, ...rest }) => ({
          ...rest,
          price_list_id: newList.id,
        }));
        await supabase.from('price_entries').insert(cloned);
      }
    }

    setNewListName('');
    await load();
    setCreatingList(false);
  };

  const groupedEntries = (listId) => {
    const all = entries[listId] ?? [];
    return CATEGORIES.reduce((acc, cat) => {
      acc[cat] = all.filter((e) => e.product_category === cat);
      return acc;
    }, {});
  };

  const isDoor = (e) => e.product_category === 'door';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-primary">Price Lists</h1>
          <p className="text-muted text-xs">Manage versioned price lists. Only one can be active at a time.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-xs text-muted hover:text-primary cursor-pointer transition-colors">
          <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} /> Refresh
        </button>
      </div>

      {/* Create new list */}
      <div className="bg-white border border-border rounded-lg p-4 mb-6 flex items-center gap-3">
        <input
          type="text"
          placeholder="New price list name (e.g. Price List v2 — June 2026)"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && createNewList()}
          className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:border-accent outline-none transition-colors"
        />
        <button
          onClick={createNewList}
          disabled={creatingList || !newListName.trim()}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-primary-light transition-colors cursor-pointer disabled:opacity-50"
        >
          {creatingList ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />}
          Create (clones active list)
        </button>
      </div>

      {saveError && (
        <div className="flex items-center gap-2 text-xs text-danger bg-red-50 p-3 rounded-lg mb-4">
          <AlertCircle className="w-3.5 h-3.5" strokeWidth={1.5} /> {saveError}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-accent animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {lists.map((list) => (
            <div key={list.id} className="bg-white border border-border rounded-lg overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-primary text-sm">{list.name}</span>
                    {list.is_active && (
                      <span className="flex items-center gap-1 text-[10px] bg-success/10 text-success px-2 py-0.5 rounded-full font-semibold">
                        <Check className="w-3 h-3" strokeWidth={2} /> Active
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-muted mt-0.5">
                    Created {new Date(list.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {list.description ? ` · ${list.description}` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!list.is_active && (
                    <button
                      onClick={() => activateList(list.id)}
                      disabled={activating === list.id}
                      className="text-[10px] px-3 py-1.5 bg-accent text-white rounded-lg font-medium hover:bg-accent-light cursor-pointer disabled:opacity-50 transition-colors"
                    >
                      {activating === list.id ? 'Activating...' : 'Activate'}
                    </button>
                  )}
                  <button
                    onClick={() => toggleExpand(list.id)}
                    className="text-muted hover:text-primary cursor-pointer transition-colors"
                  >
                    {expanded === list.id ? <ChevronUp className="w-5 h-5" strokeWidth={1.5} /> : <ChevronDown className="w-5 h-5" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              {/* Expanded price editor */}
              {expanded === list.id && (
                <div className="border-t border-border p-4 bg-stone-50">
                  {/* Category tabs */}
                  <div className="flex gap-2 mb-4">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setExpandedCat(cat)}
                        className={`text-[10px] px-3 py-1.5 rounded-lg font-semibold cursor-pointer capitalize transition-colors uppercase tracking-wide ${
                          expandedCat === cat ? 'bg-primary text-white' : 'bg-white border border-border text-stone-600 hover:border-accent'
                        }`}
                      >
                        {cat.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {Object.entries(
                      groupedEntries(list.id)[expandedCat]?.reduce((acc, e) => {
                        const key = e.product_type;
                        if (!acc[key]) acc[key] = [];
                        acc[key].push(e);
                        return acc;
                      }, {}) ?? {}
                    ).map(([type, typeEntries]) => (
                      <div key={type} className="bg-white rounded-lg border border-border overflow-hidden">
                        <div className="px-4 py-2 bg-stone-100 text-[10px] font-semibold text-muted uppercase tracking-widest">
                          {PRODUCT_TYPE_LABELS[type] ?? type}
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-muted border-b border-border">
                                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wide">W range</th>
                                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wide">H range</th>
                                {isDoor(typeEntries[0]) ? (
                                  <>
                                    <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wide">Traditional</th>
                                    <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wide">Design</th>
                                    <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wide">WG Trad.</th>
                                    <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wide">WG Design</th>
                                  </>
                                ) : (
                                  <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wide">Base Price</th>
                                )}
                                <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wide">Install</th>
                                <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wide">Save</th>
                              </tr>
                            </thead>
                            <tbody>
                              {typeEntries.map((entry) => (
                                <tr key={entry.id} className="border-t border-stone-100 hover:bg-stone-50 transition-colors">
                                  <td className="px-3 py-2 text-stone-600 whitespace-nowrap">
                                    {entry.width_min === entry.width_max ? `${entry.width_min}"` : `${entry.width_min}"–${entry.width_max}"`}
                                  </td>
                                  <td className="px-3 py-2 text-stone-600 whitespace-nowrap">
                                    {entry.height_min === entry.height_max ? `${entry.height_min}"` : `${entry.height_min}"–${entry.height_max}"`}
                                  </td>
                                  {isDoor(entry) ? (
                                    <>
                                      {['price_traditional','price_design','price_wg_traditional','price_wg_design'].map((field) => (
                                        <td key={field} className="px-3 py-2">
                                          <input
                                            type="number"
                                            value={entry[field] ?? ''}
                                            onChange={(e) => updateEntry(list.id, entry.id, field, e.target.value)}
                                            className="w-24 border border-border rounded px-2 py-1 text-right focus:border-accent outline-none bg-white text-sm transition-colors"
                                            placeholder="\u2014"
                                          />
                                        </td>
                                      ))}
                                    </>
                                  ) : (
                                    <td className="px-3 py-2">
                                      <input
                                        type="number"
                                        value={entry.base_price ?? ''}
                                        onChange={(e) => updateEntry(list.id, entry.id, 'base_price', e.target.value)}
                                        className="w-24 border border-border rounded px-2 py-1 text-right focus:border-accent outline-none bg-white text-sm transition-colors"
                                        placeholder="\u2014"
                                      />
                                    </td>
                                  )}
                                  <td className="px-3 py-2">
                                    <input
                                      type="number"
                                      value={entry.install_fee ?? ''}
                                      onChange={(e) => updateEntry(list.id, entry.id, 'install_fee', e.target.value)}
                                      className="w-20 border border-border rounded px-2 py-1 text-right focus:border-accent outline-none bg-white text-sm transition-colors"
                                    />
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    <button
                                      onClick={() => saveEntry(list.id, entry)}
                                      disabled={saving[entry.id]}
                                      className="text-accent hover:text-accent-dark cursor-pointer disabled:opacity-50 transition-colors"
                                    >
                                      {saving[entry.id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" strokeWidth={1.5} />}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}

                    {(groupedEntries(list.id)[expandedCat]?.length === 0) && (
                      <div className="text-center py-8 text-muted text-xs">No entries in this category.</div>
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
