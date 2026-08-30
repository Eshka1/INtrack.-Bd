import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export default function LowStockAlertBanner({ inventory = [], onQuickRestock }) {
  const lowStockItems = inventory.filter((item) => item.currentBalance <= item.safetyStock);

  if (lowStockItems.length === 0) return null;

  return (
    <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-4 backdrop-blur-md flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-500/10 rounded-xl text-red-400">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-red-300 text-sm">Low Stock Alert Detected</h3>
          <p className="text-xs text-red-200/70">
            {lowStockItems.length} raw material(s) have fallen below safety thresholds.
          </p>
        </div>
      </div>
      <button
        onClick={onQuickRestock}
        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
      >
        Order Restock <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}