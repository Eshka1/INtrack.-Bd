import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LowStockAlertBanner from './components/LowStockAlertBanner';
import SupplierDirectory from './components/SupplierDirectory';
import POIngestionPanel from './components/POIngestionPanel';
import DynamicRecipeBuilder from './components/DynamicRecipeBuilder';
import ManufacturingRunModal from './components/ManufacturingRunModal';
import { initialMockData } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [suppliers, setSuppliers] = useState(initialMockData.suppliers);
  const [inventory, setInventory] = useState(initialMockData.inventory);
  const [recipes, setRecipes] = useState(initialMockData.recipes);
  const [purchaseOrders, setPurchaseOrders] = useState(initialMockData.purchaseOrders);

  // 2.1 Add Supplier
  const handleAddSupplier = (newSupplier) => {
    setSuppliers([newSupplier, ...suppliers]);
  };

  // 2.2 Ingest PO and update balances
  const handleIngestShipment = (poId, receiptData) => {
    setInventory((prevStock) =>
      prevStock.map((stock) => {
        const receivedItem = receiptData.receivedItems.find((item) => item.sku === stock.sku);
        if (receivedItem) {
          return {
            ...stock,
            currentQuantity: Number((stock.currentQuantity + Number(receivedItem.quantity)).toFixed(4)),
          };
        }
        return stock;
      })
    );

    setPurchaseOrders((prevPOs) =>
      prevPOs.map((po) => (po._id === poId ? { ...po, status: 'RECEIVED' } : po))
    );
  };

  // 2.3 Save Recipe
  const handleSaveRecipe = (newRecipe) => {
    setRecipes([newRecipe, ...recipes]);
  };

  // 2.4 Execute Manufacturing Run with decimal reductions
  const handleExecuteRun = (runData) => {
    setInventory((prevStock) =>
      prevStock.map((stock) => {
        const deduction = runData.deductions.find((d) => d.sku === stock.sku);
        if (deduction) {
          return {
            ...stock,
            currentQuantity: Number((stock.currentQuantity - deduction.requiredTotal).toFixed(4)),
          };
        }
        return stock;
      })
    );

    return {
      runNumber: `RUN-${Date.now().toString().slice(-5)}`,
      quantityProduced: runData.quantityProduced,
      timestamp: new Date().toISOString(),
    };
  };

  const alertCount = inventory.filter((item) => item.currentQuantity <= item.safetyStockThreshold).length;

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-forest-950 via-forest-900 to-forest-850 pb-20 selection:bg-emerald-300 selection:text-forest-950">
      {/* Organic Ambient Glowing Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Main Container */}
      <div className="relative z-10">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} alertCount={alertCount} />

        <main className="max-w-7xl mx-auto px-4">
          {activeTab === 'inventory' && <LowStockAlertBanner inventory={inventory} />}
          {activeTab === 'suppliers' && <SupplierDirectory suppliers={suppliers} onAddSupplier={handleAddSupplier} />}
          {activeTab === 'po' && <POIngestionPanel purchaseOrders={purchaseOrders} onIngestShipment={handleIngestShipment} />}
          {activeTab === 'recipes' && <DynamicRecipeBuilder recipes={recipes} inventory={inventory} onSaveRecipe={handleSaveRecipe} />}
          {activeTab === 'manufacturing' && <ManufacturingRunModal recipes={recipes} inventory={inventory} onExecuteRun={handleExecuteRun} />}
        </main>
      </div>
    </div>
  );
}