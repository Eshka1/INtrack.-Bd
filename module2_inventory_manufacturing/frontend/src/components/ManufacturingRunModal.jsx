import React, { useState } from 'react';
import { Play, CheckCircle2, AlertTriangle, Cpu, Factory } from 'lucide-react';

export default function ManufacturingRunModal({ recipes, inventory, onExecuteRun }) {
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipes[0]?._id || '');
  const [batchQuantity, setBatchQuantity] = useState(10);
  const [runLog, setRunLog] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const currentRecipe = recipes.find((r) => r._id === selectedRecipeId) || recipes[0];

  // Calculate live deductions & stock validation
  const deductionsPreview = currentRecipe?.ingredients.map((ing) => {
    const requiredTotal = Number((ing.consumptionPerPiece * batchQuantity).toFixed(4));
    const stockItem = inventory.find((item) => item.sku === ing.sku);
    const available = stockItem ? stockItem.currentQuantity : 0;
    const hasEnough = available >= requiredTotal;

    return {
      ...ing,
      requiredTotal,
      available,
      hasEnough,
    };
  });

  const canExecute = deductionsPreview?.every((d) => d.hasEnough);

  const handleRun = () => {
    if (!canExecute) {
      setErrorMsg('Insufficient stock to complete this production batch.');
      return;
    }
    setErrorMsg('');

    const result = onExecuteRun({
      recipeId: currentRecipe._id,
      quantityProduced: Number(batchQuantity),
      deductions: deductionsPreview,
    });

    setRunLog(result);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-emerald-50">Real-Time Manufacturing Execution</h2>
        <p className="text-xs text-emerald-300/60 mt-0.5">Execute batch runs with atomic, decimal-precise inventory balance reductions[cite: 1]</p>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-emerald-400/20 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-emerald-900/40">
          <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-400/30">
            <Factory className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-emerald-100">Factory Floor Execution Console</h3>
            <p className="text-xs text-emerald-300/60">Select recipe and input batch yield to preview stock impacts</p>
          </div>
        </div>

        {/* Recipe Selection & Yield */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-emerald-300/80 block mb-1">Target Product Recipe</label>
            <select
              value={selectedRecipeId}
              onChange={(e) => setSelectedRecipeId(e.target.value)}
              className="glass-input w-full p-2.5 rounded-xl bg-forest-950"
            >
              {recipes.map((r) => (
                <option key={r._id} value={r._id} className="bg-forest-900 text-emerald-100">
                  {r.productName} ({r.productSku})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-emerald-300/80 block mb-1">Target Production Units (Pieces)</label>
            <input
              type="number"
              min="1"
              value={batchQuantity}
              onChange={(e) => setBatchQuantity(Math.max(1, Number(e.target.value)))}
              className="glass-input w-full p-2.5 rounded-xl font-mono"
            />
          </div>
        </div>

        {/* Live Decimal Deduction Preview */}
        <div className="space-y-3 bg-forest-950/60 p-4 rounded-2xl border border-emerald-500/20">
          <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
            Material Balance Deduction Preview[cite: 1]
          </h4>
          <div className="space-y-2 text-xs">
            {deductionsPreview?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 rounded-xl bg-forest-900/40 border border-emerald-900/40">
                <div>
                  <span className="font-medium text-emerald-100">{item.itemName}</span>
                  <span className="text-[10px] text-emerald-400/60 block font-mono">
                    Rate: {item.consumptionPerPiece} {item.unitOfMeasure} × {batchQuantity} pcs
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-200">
                    - {item.requiredTotal.toFixed(2)} {item.unitOfMeasure}
                  </div>
                  <div className={`text-[10px] font-medium ${item.hasEnough ? 'text-emerald-400' : 'text-red-400'}`}>
                    Available: {item.available.toFixed(2)} {item.unitOfMeasure}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/50 border border-red-500/40 text-red-200 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            {errorMsg}
          </div>
        )}

        {runLog && (
          <div className="p-3 bg-emerald-900/50 border border-emerald-400/40 text-emerald-200 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            Manufacturing Run #{runLog.runNumber} logged! Balances atomically updated[cite: 1].
          </div>
        )}

        <button
          disabled={!canExecute}
          onClick={handleRun}
          className={`w-full py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition ${
            canExecute
              ? 'bg-emerald-300 hover:bg-emerald-200 text-forest-950 shadow-emerald-400/20 cursor-pointer'
              : 'bg-emerald-900/40 text-emerald-600 border border-emerald-900/30 cursor-not-allowed'
          }`}
        >
          <Play className="w-4 h-4 fill-current" /> Execute Production & Adjust Decimal Balances
        </button>
      </div>
    </div>
  );
}