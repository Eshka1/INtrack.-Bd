import React, { useState } from 'react';
import { X, PlayCircle, AlertCircle } from 'lucide-react';

export default function ManufacturingRunModal({ recipes = [], inventory = [], onClose, onExecute }) {
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [batches, setBatches] = useState(1);

  const selectedRecipe = recipes.find(r => (r._id || r.id) === selectedRecipeId);

  // Compute raw material requirements
  const deductions = (selectedRecipe?.ingredients || []).map(ing => {
    const stockItem = inventory.find(i => i._id === ing.rawMaterialId || i.name === ing.rawMaterialName);
    const requiredQty = Number((ing.quantityRequired * batches).toFixed(2));
    const currentStock = stockItem ? stockItem.currentBalance : 0;
    const isSufficient = currentStock >= requiredQty;

    return {
      rawMaterialId: stockItem?._id || ing.rawMaterialId,
      name: ing.rawMaterialName || stockItem?.name,
      requiredQty,
      currentStock,
      unit: ing.unit,
      isSufficient,
      totalQty: requiredQty
    };
  });

  const canExecute = selectedRecipe && deductions.length > 0 && deductions.every(d => d.isSufficient);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canExecute) return;
    onExecute({
      recipeId: selectedRecipeId,
      recipeName: selectedRecipe.name,
      batches: Number(batches),
      materialDeductions: deductions
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#06130e] border border-emerald-500/30 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
        <div className="flex justify-between items-center border-b border-emerald-500/20 pb-3">
          <h3 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-emerald-400" /> Execute Manufacturing Run
          </h3>
          <button onClick={onClose} className="text-emerald-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs uppercase font-semibold text-emerald-400">Select Recipe</label>
            <select
              value={selectedRecipeId}
              onChange={(e) => setSelectedRecipeId(e.target.value)}
              className="w-full mt-1 bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-4 py-2 text-sm text-emerald-100 focus:outline-none"
              required
            >
              <option value="">Choose Recipe...</option>
              {recipes.map(r => (
                <option key={r._id || r.id} value={r._id || r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs uppercase font-semibold text-emerald-400">Number of Batches</label>
            <input
              type="number"
              min="1"
              value={batches}
              onChange={(e) => setBatches(Math.max(1, Number(e.target.value)))}
              className="w-full mt-1 bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-4 py-2 text-sm text-emerald-100 focus:outline-none"
              required
            />
          </div>

          {selectedRecipe && (
            <div className="space-y-2 border-t border-emerald-500/20 pt-3">
              <span className="text-xs uppercase font-semibold text-emerald-400">Stock Deduction Preview</span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {deductions.map((d, i) => (
                  <div key={i} className="flex justify-between items-center text-xs p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/10">
                    <div>
                      <span className="font-semibold text-emerald-100">{d.name}</span>
                      <span className="text-emerald-400/70 block">Needs: {d.requiredQty} {d.unit} | In Stock: {d.currentStock} {d.unit}</span>
                    </div>
                    {d.isSufficient ? (
                      <span className="text-emerald-400 font-semibold">Available</span>
                    ) : (
                      <span className="text-red-400 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Insufficient
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-emerald-500/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-emerald-300 hover:bg-emerald-950 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canExecute}
              className="px-5 py-2 text-sm bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-[#06130e] font-semibold rounded-xl shadow"
            >
              Execute Run & Deduct Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}