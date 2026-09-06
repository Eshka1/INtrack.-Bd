import React, { useState } from 'react';
import { BookOpen, Plus, Layers, Trash2 } from 'lucide-react';

export default function DynamicRecipeBuilder({ inventory, recipes, onAddRecipe, onDeleteRecipe }) {
  const [recipeName, setRecipeName] = useState('');
  const [outputQty, setOutputQty] = useState(1);
  const [outputUnit, setOutputUnit] = useState('units');
  const [ingredients, setIngredients] = useState([]);

  const [selectedMatId, setSelectedMatId] = useState('');
  const [matQty, setMatQty] = useState('');
  const [ingredientUnit, setIngredientUnit] = useState('');

  const handleSelectMaterial = (e) => {
    const id = e.target.value;
    setSelectedMatId(id);
    const material = inventory.find((i) => (i._id || i.id) === id);
    if (material) {
      setIngredientUnit(material.unit || 'units');
    }
  };

  const handleAddIngredient = () => {
    if (!selectedMatId || !matQty || !ingredientUnit.trim()) return;
    const material = inventory.find((i) => (i._id || i.id) === selectedMatId);
    if (!material) return;

    setIngredients((prev) => [
      ...prev,
      {
        rawMaterialId: material._id || material.id,
        rawMaterialName: material.name,
        quantityRequired: Number(matQty),
        unit: ingredientUnit.trim().toLowerCase(),
        warehouseUnit: material.unit
      }
    ]);
    setSelectedMatId('');
    setMatQty('');
    setIngredientUnit('');
  };

  const handleRemoveIngredient = (indexToRemove) => {
    setIngredients((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveRecipe = (e) => {
    e.preventDefault();
    if (!recipeName.trim()) return;

    // Auto-flush staged inputs if user forgot to click the '+' button
    let finalIngredients = [...ingredients];
    if (selectedMatId && matQty && ingredientUnit.trim()) {
      const material = inventory.find((i) => (i._id || i.id) === selectedMatId);
      if (material) {
        finalIngredients.push({
          rawMaterialId: material._id || material.id,
          rawMaterialName: material.name,
          quantityRequired: Number(matQty),
          unit: ingredientUnit.trim().toLowerCase(),
          warehouseUnit: material.unit
        });
      }
    }

    if (finalIngredients.length === 0) {
      alert('Please add at least one required raw material ingredient to the recipe.');
      return;
    }

    onAddRecipe({
      name: recipeName.trim(),
      outputQty: Number(outputQty) || 1,
      outputUnit: outputUnit.trim() || 'units',
      ingredients: finalIngredients
    });

    setRecipeName('');
    setOutputQty(1);
    setOutputUnit('units');
    setIngredients([]);
    setSelectedMatId('');
    setMatQty('');
    setIngredientUnit('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" /> Create Bill of Materials (BOM)
        </h3>
        <p className="text-xs text-emerald-300/70 mb-6">Specify recipe ingredients and exact measurement units.</p>

        <form onSubmit={handleSaveRecipe} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-emerald-400 mb-1">Finished Product Name *</label>
            <input
              type="text"
              required
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              placeholder="e.g. 500ml Bottled Conditioner"
              className="w-full bg-[#071d15] border border-emerald-500/30 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">Batch Output Qty</label>
              <input
                type="number"
                min="1"
                value={outputQty}
                onChange={(e) => setOutputQty(e.target.value)}
                className="w-full bg-[#071d15] border border-emerald-500/30 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-400 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">Output Unit</label>
              <input
                type="text"
                value={outputUnit}
                onChange={(e) => setOutputUnit(e.target.value)}
                className="w-full bg-[#071d15] border border-emerald-500/30 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div className="border-t border-emerald-500/20 pt-4">
            <label className="block text-xs font-semibold text-emerald-400 mb-2">Add Required Ingredients</label>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-3">
              <select
                value={selectedMatId}
                onChange={handleSelectMaterial}
                className="sm:col-span-5 bg-[#071d15] border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="">Choose Material...</option>
                {inventory.map((mat) => (
                  <option key={mat._id || mat.id} value={mat._id || mat.id}>
                    {mat.name} (Stocked in {mat.unit})
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="0.0001"
                step="any"
                placeholder="Qty"
                value={matQty}
                onChange={(e) => setMatQty(e.target.value)}
                className="sm:col-span-3 bg-[#071d15] border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-bold"
              />

              <input
                type="text"
                placeholder="Unit (g, kg, ml)"
                value={ingredientUnit}
                onChange={(e) => setIngredientUnit(e.target.value)}
                className="sm:col-span-3 bg-[#071d15] border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />

              <div className="sm:col-span-1 flex items-end">
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer shadow-md"
                  title="Stage Ingredient"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {ingredients.length > 0 && (
              <div className="space-y-1.5 mb-4">
                {ingredients.map((ing, i) => (
                  <div key={i} className="flex justify-between items-center text-xs p-2.5 bg-[#071d15] border border-emerald-500/20 rounded-xl">
                    <span className="text-white font-medium">{ing.rawMaterialName}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-400 font-bold">
                        {ing.quantityRequired} {ing.unit} 
                        {ing.warehouseUnit && ing.warehouseUnit !== ing.unit && (
                          <span className="text-emerald-300/50 text-[10px] font-normal ml-1">
                            (Warehouse: {ing.warehouseUnit})
                          </span>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(i)}
                        className="text-red-400 hover:text-red-300 ml-1 cursor-pointer font-bold text-sm"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            Save BOM Recipe to MongoDB
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" /> Active Recipes
        </h3>
        {recipes.length === 0 ? (
          <div className="bg-emerald-950/20 border border-emerald-500/10 rounded-2xl p-10 text-center text-emerald-400/50 text-sm">
            No recipes created yet. Create a BOM recipe using your inventory materials.
          </div>
        ) : (
          recipes.map((rec) => {
            const recipeId = rec._id || rec.id;
            return (
              <div key={recipeId || rec.name} className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-5 shadow-xl relative group">
                <button
                  onClick={() => onDeleteRecipe(recipeId)}
                  className="absolute top-4 right-4 p-1.5 text-emerald-500/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                  title="Delete Recipe"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex justify-between items-center mb-3 pr-10">
                  <h4 className="font-bold text-white">{rec.name}</h4>
                  <span className="text-xs px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg font-semibold">
                    Batch: {rec.outputQty} {rec.outputUnit}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-emerald-300/80">
                  {rec.ingredients && rec.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex justify-between py-1 border-b border-emerald-500/10">
                      <span>{ing.rawMaterialName}</span>
                      <span className="font-mono text-emerald-400 font-semibold">{ing.quantityRequired} {ing.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}