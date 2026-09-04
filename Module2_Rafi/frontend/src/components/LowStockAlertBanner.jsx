import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export default function LowStockAlertBanner({ inventory, onQuickRestock }) {
  const lowStockItems = inventory.filter(
    (item) => Number(item.currentBalance ?? 0) <= Number(item.safetyStock ?? 0)
  );

  if (lowStockItems.length === 0) return null;

  return (
    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-500/20 rounded-xl text-red-400">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-red-300">
            {lowStockItems.length} {lowStockItems.length === 1 ? 'Material' : 'Materials'} Below Safety Target
          </h4>
          <p className="text-xs text-red-300/70">
            Critical stock levels detected: {lowStockItems.map(i => i.name).join(', ')}.
          </p>
        </div>
      </div>
      <button
        onClick={onQuickRestock}
        className="px-3.5 py-1.5 bg-red-500 hover:bg-red-400 text-black text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-red-500/20"
      >
        Ingest PO Now <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}