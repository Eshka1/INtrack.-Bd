import React from 'react';
import { AlertCircle, ArrowDownRight, PackageCheck, Layers } from 'lucide-react';

export default function LowStockAlertBanner({ inventory }) {
  const lowStockItems = inventory.filter((item) => item.currentQuantity <= item.safetyStockThreshold);

  return (
    <div className="space-y-6">
      {/* Visual Alert Banner if any threshold violated */}
      {lowStockItems.length > 0 && (
        <div className="glass-panel p-5 rounded-3xl border-l-4 border-l-amber-400/80 bg-gradient-to-r from-amber-950/30 via-forest-900/40 to-forest-950/60 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/30">
              <AlertCircle className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif text-amber-100 font-medium text-base">Critical Stock Safety Threshold Flagged</h3>
              <p className="text-xs text-amber-200/70 mt-0.5">
                {lowStockItems.length} raw material line item(s) are currently below minimum safety stock levels.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {lowStockItems.map((item) => (
              <span key={item._id} className="text-xs px-3 py-1 bg-amber-900/40 border border-amber-400/30 text-amber-200 rounded-full">
                {item.itemName} ({item.currentQuantity} {item.unitOfMeasure})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Live Warehouse Stock Grid */}
      <div className="glass-panel rounded-3xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-300" />
            <h2 className="font-serif text-xl text-emerald-50">Live Warehouse Inventory Balances</h2>
          </div>
          <span className="text-xs text-emerald-300/60 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/20">
            Total SKUs: {inventory.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {inventory.map((item) => {
            const isLow = item.currentQuantity <= item.safetyStockThreshold;
            const percentage = Math.min(100, Math.round((item.currentQuantity / (item.safetyStockThreshold * 2.5)) * 100));

            return (
              <div
                key={item._id}
                className={`glass-panel-subtle p-5 rounded-2xl border transition-all duration-300 hover:border-emerald-400/40 ${
                  isLow ? 'border-red-500/40 bg-red-950/10' : 'border-emerald-500/10'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/20 text-emerald-300">
                    {item.sku}
                  </span>
                  {isLow ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-500/30">
                      <ArrowDownRight className="w-3 h-3" /> Low Stock
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <PackageCheck className="w-3 h-3 text-emerald-400" /> Normal
                    </span>
                  )}
                </div>

                <h4 className="font-medium text-emerald-100 text-sm mb-2 truncate">{item.itemName}</h4>

                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold font-mono text-emerald-50">{item.currentQuantity.toFixed(2)}</span>
                  <span className="text-xs text-emerald-400/80">{item.unitOfMeasure}</span>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] text-emerald-300/60 mb-1">
                    <span>Safety: {item.safetyStockThreshold} {item.unitOfMeasure}</span>
                    <span>{percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-forest-950 rounded-full overflow-hidden border border-emerald-900/30">
                    <div
                      className={`h-full transition-all duration-500 ${isLow ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}