import React, { useState } from 'react';
import { 
  Boxes, 
  Truck, 
  BookOpen, 
  PlayCircle, 
  Users, 
  AlertTriangle,
  Layers
} from 'lucide-react';

import SupplierDirectory from './components/SupplierDirectory';
import POIngestionPanel from './components/POIngestionPanel';
import DynamicRecipeBuilder from './components/DynamicRecipeBuilder';
import ManufacturingRunModal from './components/ManufacturingRunModal';
import LowStockAlertBanner from './components/LowStockAlertBanner';

export default function App() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [showRunModal, setShowRunModal] = useState(false);

  // 1. Core Inventory Ledger State
  const [inventory, setInventory] = useState([
    {
      _id: 'inv_1',
      name: 'Poly Thread Spool',
      sku: 'RAW-POL-001',
      currentBalance: 8,
      safetyStock: 25,
      unit: 'spools',
      location: 'Rack A-04'
    },
    {
      _id: 'inv_2',
      name: 'Heavy Cotton Canvas (Roll)',
      sku: 'RAW-CAN-002',
      currentBalance: 4,
      safetyStock: 10,
      unit: 'rolls',
      location: 'Bay 2'
    },
    {
      _id: 'inv_3',
      name: 'Reinforced Metal Eyelets (100pk)',
      sku: 'RAW-EYE-003',
      currentBalance: 45,
      safetyStock: 20,
      unit: 'packs',
      location: 'Bin C-12'
    },
    {
      _id: 'inv_4',
      name: 'Waterproof Seam Sealant',
      sku: 'RAW-SEA-004',
      currentBalance: 12,
      safetyStock: 15,
      unit: 'liters',
      location: 'Chemical Locker 1'
    }
  ]);

  // 2. Suppliers with Product Catalogs and Pricing
  const [suppliers, setSuppliers] = useState([
    {
      _id: 'sup_1',
      name: 'Apex Textile & Thread Mills',
      contactEmail: 'orders@apexmills.com',
      leadTimeDays: 4,
      reliabilityScore: 4.9,
      products: [
        { name: 'Poly Thread Spool', sku: 'RAW-POL-001', unit: 'spools', unitPrice: 4.50 },
        { name: 'Heavy Cotton Canvas (Roll)', sku: 'RAW-CAN-002', unit: 'rolls', unitPrice: 48.00 }
      ]
    },
    {
      _id: 'sup_2',
      name: 'Bengal Hardware & Fasteners',
      contactEmail: 'supplies@bengalfasteners.com',
      leadTimeDays: 2,
      reliabilityScore: 4.7,
      products: [
        { name: 'Reinforced Metal Eyelets (100pk)', sku: 'RAW-EYE-003', unit: 'packs', unitPrice: 12.25 },
        { name: 'Heavy Duty Zip Fasteners', sku: 'RAW-ZIP-005', unit: 'pcs', unitPrice: 1.80 }
      ]
    },
    {
      _id: 'sup_3',
      name: 'Delta Sealants & Polymers',
      contactEmail: 'sales@deltachemicals.com',
      leadTimeDays: 5,
      reliabilityScore: 5.0,
      products: [
        { name: 'Waterproof Seam Sealant', sku: 'RAW-SEA-004', unit: 'liters', unitPrice: 19.50 }
      ]
    }
  ]);

  // 3. Recipes (Bill of Materials) State
  const [recipes, setRecipes] = useState([
    {
      _id: 'rec_1',
      name: 'Standard Industrial Canvas Bag',
      outputQty: 10,
      outputUnit: 'units',
      ingredients: [
        { rawMaterialId: 'inv_2', rawMaterialName: 'Heavy Cotton Canvas (Roll)', quantityRequired: 1, unit: 'rolls' },
        { rawMaterialId: 'inv_1', rawMaterialName: 'Poly Thread Spool', quantityRequired: 2, unit: 'spools' },
        { rawMaterialId: 'inv_3', rawMaterialName: 'Reinforced Metal Eyelets (100pk)', quantityRequired: 1, unit: 'packs' }
      ]
    }
  ]);

  // Handler: Add New Supplier with Catalog
  const handleAddSupplier = (newSupplier) => {
    setSuppliers((prev) => [newSupplier, ...prev]);
  };

  // Handler: Delete Supplier
  const handleDeleteSupplier = (supplierId) => {
    setSuppliers((prev) => prev.filter((s) => (s._id || s.id) !== supplierId));
  };

  // Handler: Add New Recipe (BOM)
  const handleAddRecipe = (newRecipe) => {
    setRecipes((prev) => [newRecipe, ...prev]);
  };

  // Handler: PO Ingestion & Stock Incrementing
  const handleIngestPO = (poData) => {
    setInventory((prev) => {
      const matchIndex = prev.findIndex(
        (item) => item.name.toLowerCase() === (poData.productName || '').toLowerCase() || item.sku === poData.sku
      );

      if (matchIndex > -1) {
        const updated = [...prev];
        const existingBalance = Number(updated[matchIndex].currentBalance || updated[matchIndex].balance || 0);
        const addedQty = Number(poData.quantityReceived || 0);
        
        updated[matchIndex] = {
          ...updated[matchIndex],
          currentBalance: Number((existingBalance + addedQty).toFixed(2))
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            _id: `inv_${Date.now()}`,
            name: poData.productName,
            sku: poData.sku || `RAW-${Math.floor(100 + Math.random() * 900)}`,
            currentBalance: Number(poData.quantityReceived || 0),
            safetyStock: 10,
            unit: poData.unit || 'units',
            location: 'Main Warehouse Dock'
          }
        ];
      }
    });
  };

  // Handler: Production Run Execution (Atomic Stock Decrement)
  const handleExecuteManufacturingRun = (runPayload) => {
    setInventory((prev) => {
      const updated = [...prev];
      runPayload.materialDeductions.forEach((deduction) => {
        const target = updated.find((i) => (i._id || i.id) === deduction.rawMaterialId);
        if (target) {
          const current = Number(target.currentBalance || target.balance || 0);
          target.currentBalance = Math.max(0, Number((current - deduction.totalQty).toFixed(2)));
        }
      });
      return updated;
    });
    setShowRunModal(false);
  };

  return (
    <div className="min-h-screen bg-[#06130e] text-emerald-100 font-sans selection:bg-emerald-500 selection:text-[#06130e]">
      
      {/* Top Glassmorphic Navigation Bar */}
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

          {/* Navigation Tabs */}
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

      {/* Main Workspace View */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* TAB 1: Stock & Low-Stock Alerts */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <LowStockAlertBanner inventory={inventory} onQuickRestock={() => setActiveTab('po')} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-emerald-950/40 border border-emerald-500/20 backdrop-blur-md rounded-2xl p-6 shadow-xl">
              <div>
                <h2 className="text-xl font-bold text-emerald-300">Raw Material Inventory Ledger</h2>
                <p className="text-sm text-emerald-200/70">Real-time stock balance tracking with automated safety thresholds.</p>
              </div>
              <button
                onClick={() => setShowRunModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#06130e] font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                <PlayCircle className="w-4 h-4" /> Launch Production Run
              </button>
            </div>

            {/* Inventory Table */}
            <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl overflow-x-auto backdrop-blur-xl shadow-xl">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-emerald-500/20 bg-emerald-900/30 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Material Item</th>
                    <th className="py-4 px-6">SKU Code</th>
                    <th className="py-4 px-6">Current Stock</th>
                    <th className="py-4 px-6">Safety Target</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">Health Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-500/10 text-sm">
                  {inventory.map((item) => {
                    const current = Number(item.currentBalance ?? item.balance ?? 0);
                    const threshold = Number(item.safetyStock ?? item.minStock ?? 0);
                    const isLow = current <= threshold;

                    return (
                      <tr key={item._id || item.id} className="hover:bg-emerald-900/20 transition">
                        <td className="py-4 px-6 font-semibold text-white">{item.name}</td>
                        <td className="py-4 px-6 text-emerald-400/80 font-mono text-xs">{item.sku}</td>
                        <td className="py-4 px-6 font-bold text-emerald-200">
                          {current} <span className="text-xs font-normal text-emerald-400">{item.unit}</span>
                        </td>
                        <td className="py-4 px-6 text-emerald-300/80">{threshold} {item.unit}</td>
                        <td className="py-4 px-6 text-emerald-300/70">{item.location || 'Warehouse A'}</td>
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Suppliers & Product Catalogs */}
        {activeTab === 'suppliers' && (
          <SupplierDirectory 
            suppliers={suppliers} 
            onAddSupplier={handleAddSupplier}
            onDeleteSupplier={handleDeleteSupplier} 
          />
        )}

        {/* TAB 3: Dynamic PO Ingestion */}
        {activeTab === 'po' && (
          <POIngestionPanel 
            suppliers={suppliers} 
            onIngestPO={handleIngestPO} 
          />
        )}

        {/* TAB 4: BOM Recipe Builder */}
        {activeTab === 'recipes' && (
          <DynamicRecipeBuilder 
            inventory={inventory} 
            recipes={recipes} 
            onAddRecipe={handleAddRecipe} 
          />
        )}
      </main>

      {/* Production Run Execution Modal */}
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