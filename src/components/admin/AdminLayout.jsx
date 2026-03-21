import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import AdminQuotes from './AdminQuotes';
import AdminPriceLists from './AdminPriceLists';
import { FileText, DollarSign, LogOut } from 'lucide-react';

const TABS = [
  { id: 'quotes', label: 'Quotes', icon: FileText },
  { id: 'prices', label: 'Price Lists', icon: DollarSign },
];

export default function AdminLayout({ session }) {
  const [activeTab, setActiveTab] = useState('quotes');

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-56 bg-primary text-white flex flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5 mb-0.5">
            <img src="/logo.svg" alt="Doors Plus" className="w-8 h-9" />
            <span className="font-semibold text-sm">Doors Plus</span>
          </div>
          <div className="text-[10px] text-white/40 uppercase tracking-wide">Admin Panel</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === id
                  ? 'bg-accent text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="text-[10px] text-white/40 px-3 mb-2 truncate">{session.user.email}</div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {activeTab === 'quotes' && <AdminQuotes />}
        {activeTab === 'prices' && <AdminPriceLists />}
      </main>
    </div>
  );
}
