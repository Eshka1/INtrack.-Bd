import React, { useState } from 'react';
import { Plus, Trash2, Layers, Cpu, Sparkles } from 'lucide-react';

export default function DynamicRecipeBuilder({ recipes, inventory, onSaveRecipe }) {
  const [productName, setProductName] = useState('');
  const [productSku, setProductSku] = useState('');
  const [ingredients, setIngredients] = useState([
    { itemName: inventory[0]?.itemName || '', sku: inventory[0]?.sku || '', consumptionPerPiece: 0.25, unitOfMeasure: 'kg' },
  ]);

  const addIngredientRow = () => {
    setIngredients([
      ...ingredients,
      { itemName: inventory[0]?.itemName || '', sku: inventory[0]?.sku || '', consumptionPerPiece: 0.1, unitOfMeasure: 'kg' },
    ]);
  };

  const removeRow = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateRow = (index, field, value) => {
    const updated = [...ingredients];
    if (field === 'itemName') {
      const selectedItem = inventory.find((item) => item.itemName === value);
      updated[index].itemName = value;
      updated[index].sku = selectedItem?.sku || '';
      updated[index].unitOfMeasure = selectedItem?.unitOfMeasure || 'kg';
    } else {
      updated[index][field] = value;
    }
    setIngredients(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productName || !productSku) return;

    onSaveRecipe({
      _id: `rec_${Date.now()}`,
      productName,
      productSku,
      batchYieldQuantity: 1,
      ingredients,
    });

    setProductName('');
    setProductSku('');
    setIngredients([{ itemName: inventory[0]?.itemName || '', sku: inventory[0]?.sku || '', consumptionPerPiece: 0.25, unitOfMeasure: 'kg' }]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-emerald-50">Dynamic Component Recipe Builder (BOM)</h2>
        <p className="text-xs text-emerald-300/60 mt-0.5">Map multi-ingredient Bill of Materials with decimal consumption ratios[cite: 1]</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Recipes Library */}
        <div className="glass-panel p-5 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-300">
            <Layers className="w-4 h-4" />
            <h3 className="font-serif text-base text-emerald-100">Active BOM Specs</h3>
          </div>
          {recipes.map((r) => (
            <div key={r._id} className="glass-panel-subtle p-4 rounded-2xl border border-emerald-500/10 space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-emerald-100 text-sm">{r.productName}</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-forest-950 rounded text-emerald-300 border border-emerald-500/20">
                  {r.productSku}
                </span>
              </div>
              <div className="text-[11px] text-emerald-300/70 space-y-1 pt-1 border-t border-emerald-900/30">
                {r.ingredients.map((ing, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{ing.itemName}</span>
                    <span className="font-mono text-emerald-200">{ing.consumptionPerPiece} {ing.unitOfMeasure} / pc</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right: BOM Builder Form */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-emerald-400/20">
          <h3 className="font-serif text-xl text-emerald-100 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" /> Create Production Specification
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-emerald-300/80 block mb-1">Finished Product Name</label>
                <input
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Heavyweight Utility Jacket"
                  className="glass-input w-full p-2.5 rounded-xl"
                />
              </div>
              <div>
                <label className="text-emerald-300/80 block mb-1">Product Finished SKU</label>
                <input
                  required
                  value={productSku}
                  onChange={(e) => setProductSku(e.target.value)}
                  placeholder="e.g. FIN-JKT-002"
                  className="glass-input w-full p-2.5 rounded-xl"
                />
              </div>
            </div>

            {/* Dynamic Ingredient Rows */}
            <div className="space-y-2 pt-2">
              <label className="text-xs text-emerald-300/80 block">Recipe Ingredients (Bill of Materials)</label>
              {ingredients.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-forest-950/50 p-2.5 rounded-2xl border border-emerald-500/10">
                  <select
                    value={row.itemName}
                    onChange={(e) => updateRow(idx, 'itemName', e.target.value)}
                    className="glass-input flex-1 p-2 rounded-xl text-xs bg-forest-950"
                  >
                    {inventory.map((inv) => (
                      <option key={inv._id} value={inv.itemName} className="bg-forest-900 text-emerald-100">
                        {inv.itemName} ({inv.sku})
                      </option>
                    ))}
                  </select>

                  <div className="w-32 flex items-center gap-1">
                    <input
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      value={row.consumptionPerPiece}
                      onChange={(e) => updateRow(idx, 'consumptionPerPiece', Number(e.target.value))}
                      className="glass-input w-full p-2 rounded-xl text-xs font-mono"
                    />
                    <span className="text-xs text-emerald-400 font-mono">{row.unitOfMeasure}</span>
                  </div>

                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      className="p-2 text-red-400/80 hover:text-red-300 hover:bg-red-950/40 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addIngredientRow}
              className="text-xs text-emerald-300 flex items-center gap-1 hover:text-emerald-200 transition px-2 py-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Ingredient Row
            </button>

            <button
              type="submit"
              className="w-full mt-4 bg-emerald-300 hover:bg-emerald-200 text-forest-950 font-semibold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-400/20 transition"
            >
              <Cpu className="w-4 h-4" /> Save BOM Specification to System
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}