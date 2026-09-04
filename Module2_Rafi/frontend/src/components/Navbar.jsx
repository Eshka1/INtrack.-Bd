import React from 'react';
import { Sprout, Users, ClipboardCheck, BookOpen, Cpu, AlertTriangle } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, alertCount }) {
  const navItems = [
    { id: 'inventory', label: 'Stock & Alerts', icon: AlertTriangle, badge: alertCount },
    { id: 'suppliers', label: 'Suppliers', icon: Users },
    { id: 'po', label: 'PO Ingestion', icon: ClipboardCheck },
    { id: 'recipes', label: 'BOM Recipes', icon: BookOpen },
    { id: 'manufacturing', label: 'Production Run', icon: Cpu },
  ];

  return (
    <header className="sticky top-4 z-40 max-w-7xl mx-auto px-4 mb-8">
      <nav className="glass-panel rounded-3xl p-2.5 flex items-center justify-between shadow-2xl border border-emerald-500/20">
        {/* Brand */}
        <div className="flex items-center gap-3 pl-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/60">
            <Sprout className="w-5 h-5 text-emerald-950" />
          </div>
          <div>
            <h1 className="font-serif text-lg tracking-wide text-emerald-100 font-semibold leading-tight">
              INtrack <span className="text-emerald-400 text-xs font-sans tracking-wider uppercase ml-1 px-2 py-0.5 rounded-full bg-emerald-900/50 border border-emerald-400/30">Ops M2</span>
            </h1>
            <p className="text-[11px] text-emerald-300/60">Inventory & Manufacturing System</p>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="hidden md:flex items-center gap-1 bg-forest-950/60 p-1.5 rounded-2xl border border-emerald-900/40">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-emerald-300 text-forest-950 shadow-md shadow-emerald-400/20 font-semibold'
                    : 'text-emerald-200/70 hover:text-emerald-100 hover:bg-emerald-900/30'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-forest-950' : 'text-emerald-400'}`} />
                {item.label}
                {item.badge > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-forest-950 text-emerald-300' : 'bg-red-500/80 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}