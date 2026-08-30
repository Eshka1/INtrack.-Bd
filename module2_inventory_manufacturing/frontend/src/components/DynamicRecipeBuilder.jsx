import React, { useState } from 'react';
import { Plus, BookOpen, Trash2 } from 'lucide-react';

export default function DynamicRecipeBuilder({ inventory = [], recipes = [], onAddRecipe }) {
  const [name, setName] = useState('');
  const [outputQty, setOutputQty] = useState(1);
  const [outputUnit, setOutputUnit] = useState('units');
  const [ingredients, setIngredients] = useState([
    { rawMaterialId: '', rawMaterialName: '', quantityRequired: 1, unit: 'kg' }
  ]);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { rawMaterialId: '', rawMaterialName: '', quantityRequired: 1, unit: 'kg' }]);
  };

  const handleRemoveIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    if (field === 'rawMaterialId') {
      const selected = inventory.find((i) => (i._id || i.id) === value);
      updated[index].rawMaterialId = value;
      updated[index].rawMaterialName = selected?.name || '';
      updated[index].unit = selected?.unit || 'units';
    } else {
      updated[index][field] = value;
    }
    setIngredients(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || ingredients.some(i => !i.rawMaterialId)) {
      alert('Please fill out the recipe name and select all ingredients.');
      return;
    }

    const newRecipe = {
      _id: `rec_${Date.now()}`,
      name,
      outputQty: Number(outputQty),
      outputUnit,
      ingredients: ingredients.map(i => ({
        ...i,
        quantityRequired: Number(i.quantityRequired)
      }))
    };

    if (onAddRecipe) onAddRecipe(newRecipe);
    setName('');
    setOutputQty(1);
    setIngredients([{ rawMaterialId: '', rawMaterialName: '', quantityRequired: 1, unit: 'units' }]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit} className="lg:col-span-1 bg-emerald-950/30 border border-emerald-500/20 backdrop-blur-md rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" /> New BOM Recipe
        </h3>

        <div>
          <label className="text-xs uppercase font-semibold text-emerald-400">Recipe / Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Industrial Tote Bag"
            className="w-full mt-1 bg-[#06130e] border border-emerald-500/30 rounded-xl px-3 py-2 text-sm text-emerald-100 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs uppercase font-semibold text-emerald-400">Batch Yield</label>
            <input
              type="number"
              min="1"
              value={outputQty}
              onChange={(e) => setOutputQty(e.target.value)}
              className="w-full mt-1 bg-[#06130e] border border-emerald-500/30 rounded-xl px-3 py-2 text-sm text-emerald-100 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase font-semibold text-emerald-400">Unit</label>
            <input
              type="text"
              value={outputUnit}
              onChange={(e) => setOutputUnit(e.target.value)}
              className="w-full mt-1 bg-[#06130e] border border-emerald-500/30 rounded-xl px-3 py-2 text-sm text-emerald-100 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-emerald-500/20">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase font-semibold text-emerald-400">Raw Ingredients</span>
            <button
              type="button"
              onClick={handleAddIngredient}
              className="text-xs text-emerald-300 hover:text-emerald-200 flex items-center gap-1 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex gap-2 items-center bg-emerald-950/20 p-2 rounded-xl border border-emerald-500/10">
              <select
                value={ing.rawMaterialId}
                onChange={(e) => handleIngredientChange(idx, 'rawMaterialId', e.target.value)}
                className="w-1/2 bg-[#06130e] border border-emerald-500/30 rounded-lg px-2 py-1 text-xs text-emerald-100 focus:outline-none"
                required
              >
                <option value="">Select Material...</option>
                {inventory.map((mat) => (
                  <option key={mat._id || mat.id} value={mat._id || mat.id}>{mat.name}</option>
                ))}
              </select>
              <input
                type="number"
                step="any"
                min="0.01"
                value={ing.quantityRequired}
                onChange={(e) => handleIngredientChange(idx, 'quantityRequired', e.target.value)}
                className="w-1/4 bg-[#06130e] border border-emerald-500/30 rounded-lg px-2 py-1 text-xs text-emerald-100 focus:outline-none"
                required
              />
              <span className="text-xs text-emerald-400 w-1/6">{ing.unit}</span>
              <button
                type="button"
                disabled={ingredients.length === 1}
                onClick={() => handleRemoveIngredient(idx)}
                className="text-red-400 disabled:opacity-20"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#06130e] font-semibold rounded-xl text-sm transition"
        >
          Save BOM Recipe
        </button>
      </form>

      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-lg font-bold text-emerald-300">Registered BOM Formulations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recipes.map((r) => (
            <div key={r._id} className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-emerald-200">{r.name}</h4>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Yield: {r.outputQty} {r.outputUnit}
                </span>
              </div>
              <div className="text-xs space-y-1 bg-[#06130e]/50 p-2.5 rounded-xl border border-emerald-500/10">
                {r.ingredients.map((ing, i) => (
                  <div key={i} className="flex justify-between text-emerald-300/80">
                    <span>• {ing.rawMaterialName}</span>
                    <span className="font-mono text-emerald-400">{ing.quantityRequired} {ing.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}