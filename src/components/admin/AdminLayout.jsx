import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import AdminQuotes from './AdminQuotes';
import AdminPriceLists from './AdminPriceLists';
import { Shield, FileText, DollarSign, LogOut, BarChart2 } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-950 text-white flex flex-col">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-0.5">
            <Shield className="w-5 h-5 text-accent" />
            <span className="font-bold text-sm">Two Doors Plus</span>
          </div>
          <div className="text-xs text-gray-500">Admin Panel</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === id
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800">
          <div className="text-xs text-gray-500 px-3 mb-2">{session.user.email}</div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out
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
