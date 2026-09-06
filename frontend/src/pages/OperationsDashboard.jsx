import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Boxes, BookOpen, Layers, PlayCircle, RefreshCw, Truck, Users } from 'lucide-react';
import SupplierDirectory from '../components/module2/SupplierDirectory';
import POIngestionPanel from '../components/module2/POIngestionPanel';
import DynamicRecipeBuilder from '../components/module2/DynamicRecipeBuilder';
import ManufacturingRunModal from '../components/module2/ManufacturingRunModal';
import LowStockAlertBanner from '../components/module2/LowStockAlertBanner';
import { module2Api } from '../services/module2Api';
import '../styles/module2.css';

const inventoryForUi = (items = []) => items.map((item) => ({
  ...item,
  name: item.itemName,
  currentBalance: item.currentQuantity,
  safetyStock: item.safetyStockThreshold,
  unit: item.unitOfMeasure,
  location: item.warehouseName
}));

export default function OperationsDashboard() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [showRunModal, setShowRunModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [recipes, setRecipes] = useState([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [inventoryResult, supplierResult, recipeResult] = await Promise.all([
        module2Api.getInventory(), module2Api.getSuppliers(), module2Api.getRecipes()
      ]);
      setInventory(inventoryForUi(inventoryResult.inventory));
      setSuppliers(supplierResult);
      setRecipes(recipeResult.map((recipe) => ({
        ...recipe,
        name: recipe.productName,
        outputQty: recipe.batchYieldQuantity,
        outputUnit: 'units',
        ingredients: recipe.ingredients.map((item) => ({
          ...item,
          rawMaterialName: item.itemName,
          quantityRequired: item.consumptionPerPiece,
          unit: item.unitOfMeasure
        }))
      })));
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to load inventory operations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addSupplier = async (payload) => {
    const saved = await module2Api.createSupplier(payload);
    setSuppliers((current) => [saved, ...current]);
  };
  const updateSupplier = async (id, payload) => {
    const updated = await module2Api.updateSupplier(id, payload);
    setSuppliers((current) => current.map((supplier) => supplier._id === id ? updated : supplier));
  };
  const deleteSupplier = async (id) => {
    await module2Api.deleteSupplier(id);
    setSuppliers((current) => current.filter((supplier) => supplier._id !== id));
  };
  const addRecipe = async (payload) => {
    const saved = await module2Api.createRecipe({
      productName: payload.name,
      productSku: `FIN-${Date.now()}`,
      batchYieldQuantity: payload.outputQty,
      ingredients: payload.ingredients.map((item) => ({
        itemName: item.rawMaterialName,
        sku: inventory.find((stock) => stock._id === item.rawMaterialId)?.sku,
        consumptionPerPiece: item.quantityRequired,
        unitOfMeasure: item.unit
      }))
    });
    setRecipes((current) => [{ ...saved, name: saved.productName, outputQty: saved.batchYieldQuantity, outputUnit: 'units', ingredients: payload.ingredients }, ...current]);
  };
  const deleteRecipe = async (id) => {
    await module2Api.deleteRecipe(id);
    setRecipes((current) => current.filter((recipe) => recipe._id !== id));
  };
  const ingestPurchase = async (payload) => {
    const po = await module2Api.createPurchaseOrder({
      poNumber: `PO-${Date.now()}`,
      supplierId: payload.supplierId,
      warehouseName: payload.location,
      items: [{ itemName: payload.productName, sku: payload.sku, orderedQuantity: payload.quantityReceived, unitCost: payload.unitCost, unitOfMeasure: payload.unit }]
    });
    await module2Api.ingestShipment(po._id, { receivedItems: [{ sku: payload.sku, quantity: payload.quantityReceived }], verifiedWeight: payload.quantityReceived });
    await refresh();
  };
  const executeRun = async (payload) => {
    const recipe = recipes.find((item) => item._id === payload.recipeId);
    await module2Api.executeManufacturingRun({ recipeId: payload.recipeId, quantityProduced: Number(payload.batches) * Number(recipe?.batchYieldQuantity || 1) });
    setShowRunModal(false);
    await refresh();
  };

  const tabs = [
    ['inventory', Boxes, 'Stock & Alerts'], ['suppliers', Users, 'Suppliers'],
    ['po', Truck, 'PO Ingestion'], ['recipes', BookOpen, 'BOM Recipes']
  ];

  return (
    <div className="module2-shell min-h-screen bg-[#06130e] text-emerald-100 font-sans">
      <header className="sticky top-0 z-40 bg-[#06130e]/80 border-b border-emerald-500/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3"><Layers className="w-7 h-7 text-emerald-400" /><div><h1 className="text-xl font-bold text-white">INtrack <span className="text-xs text-emerald-400">Module 2</span></h1><p className="text-xs text-emerald-300/70">Inventory & Manufacturing Operations Engine</p></div></div>
          <nav className="flex flex-wrap items-center gap-2">
            {tabs.map(([id, Icon, label]) => <button key={id} onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${activeTab === id ? 'bg-emerald-500 text-black' : 'bg-emerald-950 text-emerald-300'}`}><Icon className="w-4 h-4" />{label}</button>)}
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {error && <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 flex justify-between"><span><AlertTriangle className="inline w-4 h-4" /> {error}</span><button onClick={refresh}>Retry</button></div>}
        {loading ? <div className="py-20 text-center text-emerald-400"><RefreshCw className="w-8 h-8 animate-spin mx-auto" />Loading operations…</div> : <>
          {activeTab === 'inventory' && <div className="space-y-6"><LowStockAlertBanner inventory={inventory} onQuickRestock={() => setActiveTab('po')} /><div className="flex justify-between items-center bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-6"><div><h2 className="text-xl font-bold">Raw Material Inventory Ledger</h2><p className="text-sm text-emerald-200/70">Tenant-isolated operational balances.</p></div><button onClick={() => setShowRunModal(true)} className="px-4 py-2 bg-emerald-500 text-black rounded-xl flex gap-2"><PlayCircle className="w-4 h-4" />Launch Production Run</button></div><div className="bg-emerald-950/30 rounded-2xl overflow-x-auto"><table className="w-full text-left"><thead><tr><th>Material</th><th>SKU</th><th>Stock</th><th>Safety target</th><th>Location</th><th>Status</th></tr></thead><tbody>{inventory.map((item) => <tr key={item._id}><td>{item.name}</td><td>{item.sku}</td><td>{item.currentBalance} {item.unit}</td><td>{item.safetyStock} {item.unit}</td><td>{item.location}</td><td>{item.currentBalance <= item.safetyStock ? 'Low Stock' : 'Optimal'}</td></tr>)}</tbody></table>{inventory.length === 0 && <p className="p-8 text-center">No materials yet. Receive a purchase order to add stock.</p>}</div></div>}
          {activeTab === 'suppliers' && <SupplierDirectory suppliers={suppliers} onAddSupplier={addSupplier} onUpdateSupplier={updateSupplier} onDeleteSupplier={deleteSupplier} />}
          {activeTab === 'po' && <POIngestionPanel suppliers={suppliers} onIngestPO={ingestPurchase} />}
          {activeTab === 'recipes' && <DynamicRecipeBuilder inventory={inventory} recipes={recipes} onAddRecipe={addRecipe} onDeleteRecipe={deleteRecipe} />}
        </>}
      </main>
      {showRunModal && <ManufacturingRunModal recipes={recipes} inventory={inventory} onClose={() => setShowRunModal(false)} onExecute={executeRun} />}
    </div>
  );
}
