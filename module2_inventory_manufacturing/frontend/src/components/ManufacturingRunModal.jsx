import React, { useState } from 'react';
import { X, PlayCircle, AlertCircle, ArrowRight } from 'lucide-react';

const CLIENT_CONVERSIONS = {
  ton: { family: 'mass', ratio: 1000000 },
  t: { family: 'mass', ratio: 1000000 },
  kg: { family: 'mass', ratio: 1000 },
  kgs: { family: 'mass', ratio: 1000 },
  kilogram: { family: 'mass', ratio: 1000 },
  kilograms: { family: 'mass', ratio: 1000 },
  g: { family: 'mass', ratio: 1 },
  gram: { family: 'mass', ratio: 1 },
  grams: { family: 'mass', ratio: 1 },
  mg: { family: 'mass', ratio: 0.001 },

  l: { family: 'volume', ratio: 1000 },
  liter: { family: 'volume', ratio: 1000 },
  liters: { family: 'volume', ratio: 1000 },
  ml: { family: 'volume', ratio: 1 },
  milliliter: { family: 'volume', ratio: 1 },

  km: { family: 'length', ratio: 1000000 },
  m: { family: 'length', ratio: 1000 },
  meter: { family: 'length', ratio: 1000 },
  cm: { family: 'length', ratio: 10 },
  mm: { family: 'length', ratio: 1 }
};

function convertClientUnits(qty, fromUnit, toUnit) {
  const from = (fromUnit || '').toLowerCase().trim();
  const to = (toUnit || '').toLowerCase().trim();
  if (from === to) return qty;

  const uFrom = CLIENT_CONVERSIONS[from];
  const uTo = CLIENT_CONVERSIONS[to];

  if (uFrom && uTo && uFrom.family === uTo.family) {
    return (qty * uFrom.ratio) / uTo.ratio;
  }
  return qty;
}

export default function ManufacturingRunModal({ recipes, inventory, onClose, onExecute }) {
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipes[0]?._id || '');
  const [batchesToProduce, setBatchesToProduce] = useState(1);

  const selectedRecipe = recipes.find((r) => r._id === selectedRecipeId);

  const deductions = selectedRecipe
    ? selectedRecipe.ingredients.map((ing) => {
        const totalNeededRecipeUnit = Number((ing.quantityRequired * batchesToProduce).toFixed(4));
        const currentInv = inventory.find(
          (i) => i._id === ing.rawMaterialId || i.name.toLowerCase() === ing.rawMaterialName.toLowerCase()
        );
        const inStock = Number(currentInv?.currentBalance || 0);
        const warehouseUnit = currentInv?.unit || ing.unit;

        // Convert requirement into warehouse stock unit for balance comparison
        const totalNeededWarehouseUnit = convertClientUnits(totalNeededRecipeUnit, ing.unit, warehouseUnit);
        const hasEnough = inStock >= totalNeededWarehouseUnit;

        return {
          ...ing,
          totalQty: totalNeededRecipeUnit,
          totalNeededWarehouseUnit,
          warehouseUnit,
          inStock,
          hasEnough
        };
      })
    : [];

  const canExecute = deductions.length > 0 && deductions.every((d) => d.hasEnough);

  const handleRun = () => {
    if (!canExecute) return;
    onExecute({
      recipeId: selectedRecipe._id,
      batches: Number(batchesToProduce),
      materialDeductions: deductions
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#0a1e17] border border-emerald-500/30 rounded-2xl p-6 space-y-6 shadow-2xl">
        <div className="flex justify-between items-center border-b border-emerald-500/20 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-emerald-400" /> Execute Production Run
          </h3>
          <button onClick={onClose} className="text-emerald-400 hover:text-white transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-emerald-400 mb-1">Select BOM Recipe</label>
            <select
              value={selectedRecipeId}
              onChange={(e) => setSelectedRecipeId(e.target.value)}
              className="w-full bg-[#071d15] border border-emerald-500/30 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
            >
              {recipes.map((r) => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-400 mb-1">Number of Batches to Produce</label>
            <input
              type="number"
              min="1"
              value={batchesToProduce}
              onChange={(e) => setBatchesToProduce(Math.max(1, Number(e.target.value)))}
              className="w-full bg-[#071d15] border border-emerald-500/30 rounded-xl px-4 py-2 text-sm text-white focus:outline-none font-bold"
            />
          </div>

          <div className="space-y-2 border-t border-emerald-500/20 pt-4">
            <span className="text-xs font-bold uppercase text-emerald-400">Unit-Normalized Stock Impact</span>
            <div className="space-y-2">
              {deductions.map((d, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/10">
                  <div>
                    <p className="font-semibold text-white">{d.rawMaterialName}</p>
                    <p className="text-emerald-300/70 text-[11px] mt-0.5">
                      Recipe Need: <span className="text-white font-bold">{d.totalQty} {d.unit}</span>
                      {d.unit !== d.warehouseUnit && (
                        <span> → <strong className="text-emerald-400">{d.totalNeededWarehouseUnit} {d.warehouseUnit}</strong></span>
                      )}
                    </p>
                    <p className="text-emerald-400/50 text-[10px]">
                      Warehouse Stock: {d.inStock} {d.warehouseUnit}
                    </p>
                  </div>
                  {!d.hasEnough ? (
                    <span className="text-red-400 font-bold flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20">
                      <AlertCircle className="w-3.5 h-3.5" /> Deficit
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      Ready
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-300 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleRun}
            disabled={!canExecute}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              canExecute
                ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-emerald-950 text-emerald-500/30 cursor-not-allowed border border-emerald-500/10'
            }`}
          >
            Execute Run & Deduct Stock
          </button>
        </div>
      </div>
    </div>
  );
}