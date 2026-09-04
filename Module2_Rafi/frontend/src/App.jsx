import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Truck, 
  BookOpen, 
  PlayCircle, 
  Users, 
  AlertTriangle,
  Layers,
  RefreshCw,
  Trash2
} from 'lucide-react';

import SupplierDirectory from './components/SupplierDirectory';
import POIngestionPanel from './components/POIngestionPanel';
import DynamicRecipeBuilder from './components/DynamicRecipeBuilder';
import ManufacturingRunModal from './components/ManufacturingRunModal';
import LowStockAlertBanner from './components/LowStockAlertBanner';

const API_BASE = '/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [showRunModal, setShowRunModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(null);

  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [recipes, setRecipes] = useState([]);

  const fetchAllData = async () => {
    setLoading(true);
    setConnectionError(null);
    try {
      const [invRes, supRes, recRes] = await Promise.all([
        fetch(`${API_BASE}/inventory`),
        fetch(`${API_BASE}/suppliers`),
        fetch(`${API_BASE}/recipes`)
      ]);

      if (!invRes.ok || !supRes.ok || !recRes.ok) {
        throw new Error('One or more backend endpoints returned an error');
      }

      const invData = await invRes.json();
      const supData = await supRes.json();
      const recData = await recRes.json();

      setInventory(Array.isArray(invData) ? invData : []);
      setSuppliers(Array.isArray(supData) ? supData : []);
      setRecipes(Array.isArray(recData) ? recData : []);
    } catch (err) {
      console.error('Database sync failure:', err);
      setConnectionError('Unable to connect to MongoDB backend. Verify node server.js is running on port 5050.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to permanently delete this material from inventory?')) return;

    try {
      const res = await fetch(`${API_BASE}/inventory/${materialId}`, { method: 'DELETE' });
      if (res.ok) {
        setInventory((prev) => prev.filter((item) => (item._id || item.id) !== materialId));
      }
    } catch (err) {
      console.error('Error deleting material:', err);
    }
  };

  const handleAddSupplier = async (newSupplier) => {
    try {
      const { _id, ...payload } = newSupplier;
      const res = await fetch(`${API_BASE}/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const saved = await res.json();
        setSuppliers((prev) => [saved, ...prev]);
      }
    } catch (err) {
      console.error('Failed to save supplier:', err);
    }
  };

  const handleUpdateSupplier = async (supplierId, updatedFields) => {
    try {
      const res = await fetch(`${API_BASE}/suppliers/${supplierId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        const updated = await res.json();
        setSuppliers((prev) => prev.map((s) => ((s._id || s.id) === supplierId ? updated : s)));
      }
    } catch (err) {
      console.error('Failed to update supplier:', err);
    }
  };

  const handleDeleteSupplier = async (supplierId) => {
    try {
      const res = await fetch(`${API_BASE}/suppliers/${supplierId}`, { method: 'DELETE' });
      if (res.ok) {
        setSuppliers((prev) => prev.filter((s) => (s._id || s.id) !== supplierId));
      }
    } catch (err) {
      console.error('Failed to delete supplier:', err);
    }
  };

  const handleAddRecipe = async (newRecipe) => {
    try {
      const { _id, ...payload } = newRecipe;
      const res = await fetch(`${API_BASE}/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const saved = await res.json();
        setRecipes((prev) => [saved, ...prev]);
      }
    } catch (err) {
      console.error('Failed to save recipe:', err);
    }
  };

const handleDeleteRecipe = async (recipeId) => {
  if (!recipeId) {
    console.error('Cannot delete: recipeId is undefined');
    return;
  }

  if (!window.confirm('Are you sure you want to permanently delete this recipe?')) return;

  try {
    const res = await fetch(`${API_BASE}/recipes/${recipeId}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      setRecipes((prev) => prev.filter((r) => (r._id || r.id) !== recipeId));
    } else {
      const errData = await res.json().catch(() => ({}));
      console.error('Server failed to delete recipe:', res.status, errData);
      alert(`Delete failed: ${errData.error || 'Server rejected request'}`);
    }
  } catch (err) {
    console.error('Network error while deleting recipe:', err);
  }
};
  const handleIngestPO = async (poData) => {
    try {
      const res = await fetch(`${API_BASE}/po/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poData)
      });
      if (res.ok) {
        const savedItem = await res.json();
        setInventory((prev) => {
          const exists = prev.some((i) => i.sku === savedItem.sku || i._id === savedItem._id);
          if (exists) {
            return prev.map((i) => (i.sku === savedItem.sku || i._id === savedItem._id ? savedItem : i));
          }
          return [savedItem, ...prev];
        });
      }
    } catch (err) {
      console.error('Failed to sync PO ingestion:', err);
    }
  };

  const handleExecuteManufacturingRun = async (runPayload) => {
    try {
      const res = await fetch(`${API_BASE}/manufacturing/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(runPayload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.inventory) setInventory(data.inventory);
        setShowRunModal(false);
      }
    } catch (err) {
      console.error('Failed to execute manufacturing run:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#06130e] text-emerald-100 font-sans selection:bg-emerald-500 selection:text-[#06130e]">
      <header className="sticky top-0 z-40 bg-[#06130e]/80 backdrop-blur-md border-b border-emerald-500/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                INtrack <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Module 2</span>
              </h1>
              <p className="text-xs text-emerald-300/70">Inventory & Manufacturing Operations Engine</p>
            </div>
          </div>

          <nav className="flex items-center gap-2 bg-emerald-950/40 p-1.5 rounded-2xl border border-emerald-500/20">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'inventory' 
                  ? 'bg-emerald-500 text-[#06130e] shadow-lg shadow-emerald-500/20' 
                  : 'text-emerald-300 hover:text-emerald-100 hover:bg-emerald-900/30'
              }`}
            >
              <Boxes className="w-4 h-4" /> Stock & Alerts
            </button>

            <button
              onClick={() => setActiveTab('suppliers')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'suppliers' 
                  ? 'bg-emerald-500 text-[#06130e] shadow-lg shadow-emerald-500/20' 
                  : 'text-emerald-300 hover:text-emerald-100 hover:bg-emerald-900/30'
              }`}
            >
              <Users className="w-4 h-4" /> Suppliers
            </button>

            <button
              onClick={() => setActiveTab('po')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'po' 
                  ? 'bg-emerald-500 text-[#06130e] shadow-lg shadow-emerald-500/20' 
                  : 'text-emerald-300 hover:text-emerald-100 hover:bg-emerald-900/30'
              }`}
            >
              <Truck className="w-4 h-4" /> PO Ingestion
            </button>

            <button
              onClick={() => setActiveTab('recipes')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'recipes' 
                  ? 'bg-emerald-500 text-[#06130e] shadow-lg shadow-emerald-500/20' 
                  : 'text-emerald-300 hover:text-emerald-100 hover:bg-emerald-900/30'
              }`}
            >
              <BookOpen className="w-4 h-4" /> BOM Recipes
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {connectionError && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-between text-red-400 text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{connectionError}</span>
            </div>
            <button
              onClick={fetchAllData}
              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-emerald-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <p className="text-sm font-semibold">Connecting to MongoDB Ledger...</p>
          </div>
        ) : (
          <>
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <LowStockAlertBanner inventory={inventory} onQuickRestock={() => setActiveTab('po')} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-emerald-950/40 border border-emerald-500/20 backdrop-blur-md rounded-2xl p-6 shadow-xl">
                  <div>
                    <h2 className="text-xl font-bold text-emerald-300">Raw Material Inventory Ledger</h2>
                    <p className="text-sm text-emerald-200/70">Real-time balances synchronized directly from MongoDB.</p>
                  </div>
                  <button
                    onClick={() => setShowRunModal(true)}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#06130e] font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                  >
                    <PlayCircle className="w-4 h-4" /> Launch Production Run
                  </button>
                </div>

                <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl overflow-x-auto backdrop-blur-xl shadow-xl">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-emerald-500/20 bg-emerald-900/30 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                        <th className="py-4 px-6">Material Item</th>
                        <th className="py-4 px-6">SKU Code</th>
                        <th className="py-4 px-6">Current Stock</th>
                        <th className="py-4 px-6">Safety Target</th>
                        <th className="py-4 px-6">Location</th>
                        <th className="py-4 px-6">Health Status</th>
                        <th className="py-4 px-6 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-500/10 text-sm">
                      {inventory.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-8 text-center text-emerald-400/60">
                            No materials found in the database. Add materials via PO Ingestion.
                          </td>
                        </tr>
                      ) : (
                        inventory.map((item) => {
                          const current = Number(item.currentBalance ?? 0);
                          const threshold = Number(item.safetyStock ?? 0);
                          const isLow = current <= threshold;

                          return (
                            <tr key={item._id || item.sku} className="hover:bg-emerald-900/20 transition">
                              <td className="py-4 px-6 font-semibold text-white">{item.name}</td>
                              <td className="py-4 px-6 text-emerald-400/80 font-mono text-xs">{item.sku}</td>
                              <td className="py-4 px-6 font-bold text-emerald-200">
                                {current} <span className="text-xs font-normal text-emerald-400">{item.unit}</span>
                              </td>
                              <td className="py-4 px-6 text-emerald-300/80">{threshold} {item.unit}</td>
                              <td className="py-4 px-6 text-emerald-300/70">{item.location || 'Main Warehouse Dock'}</td>
                              <td className="py-4 px-6">
                                {isLow ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 border border-red-500/30 text-red-400">
                                    <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                                    Optimal
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-6 text-center">
                                <button
                                  onClick={() => handleDeleteMaterial(item._id)}
                                  className="p-1.5 text-emerald-500/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                                  title="Delete Material"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'suppliers' && (
              <SupplierDirectory 
                suppliers={suppliers} 
                onAddSupplier={handleAddSupplier}
                onUpdateSupplier={handleUpdateSupplier}
                onDeleteSupplier={handleDeleteSupplier} 
              />
            )}

            {activeTab === 'po' && (
              <POIngestionPanel 
                suppliers={suppliers} 
                onIngestPO={handleIngestPO} 
              />
            )}

            {activeTab === 'recipes' && (
              <DynamicRecipeBuilder 
                inventory={inventory} 
                recipes={recipes} 
                onAddRecipe={handleAddRecipe}
                onDeleteRecipe={handleDeleteRecipe}
              />
            )}
          </>
        )}
      </main>

      {showRunModal && (
        <ManufacturingRunModal
          recipes={recipes}
          inventory={inventory}
          onClose={() => setShowRunModal(false)}
          onExecute={handleExecuteManufacturingRun}
        />
      )}
    </div>
  );
}