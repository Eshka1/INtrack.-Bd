import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Boxes, 
  Truck, 
  BookOpen, 
  PlayCircle, 
  Users, 
  AlertTriangle,
  Layers,
  RefreshCw,
  Trash2,
  DollarSign,
  Building2,
  FolderTree,
  CreditCard,
  LogOut
} from 'lucide-react';

// Context
import { TenantProvider } from './context/TenantContext';

// Module 1 Components & Pages
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import RegisterCompany from './pages/RegisterCompany';
import AcceptInvite from './pages/AcceptInvite';
import Dashboard from './pages/Dashboard';
import TeamManagement from './pages/TeamManagement';
import Warehouses from './pages/Warehouses';
import AssetCategories from './pages/AssetCategories';
import Billing from './pages/Billing';

// Module 3 UI & Pages
import NeuNavbar from './components/ui/NeuNavbar';
import ExpenseCreatePage from './pages/ExpenseCreatePage';
import ExpensesPage from './pages/ExpensesPage';
import BudgetPage from './pages/BudgetPage';
import PayablesPage from './pages/PayablesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import FinanceDashboard from './pages/FinanceDashboard';
import CurrencySettingsPage from './pages/CurrencySettingsPage';

// Module 2 Components
import SupplierDirectory from './components/SupplierDirectory';
import POIngestionPanel from './components/POIngestionPanel';
import DynamicRecipeBuilder from './components/DynamicRecipeBuilder';
import ManufacturingRunModal from './components/ManufacturingRunModal';
import LowStockAlertBanner from './components/LowStockAlertBanner';

const API_BASE = '/api';

// ==========================================
// Module 2: Operations View
// ==========================================
export function Module2OperationsView() {
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

      setInventory(Array.isArray(invData) ? invData : (invData.inventory || []));
      setSuppliers(Array.isArray(supData) ? supData : (supData.data || []));
      setRecipes(Array.isArray(recData) ? recData : (recData.data || []));
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
    if (!recipeId) return;
    if (!window.confirm('Are you sure you want to permanently delete this recipe?')) return;

    try {
      const res = await fetch(`${API_BASE}/recipes/${recipeId}`, { method: 'DELETE' });
      if (res.ok) {
        setRecipes((prev) => prev.filter((r) => (r._id || r.id) !== recipeId));
      } else {
        const errData = await res.json().catch(() => ({}));
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Module 2 <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Operations</span>
            </h2>
            <p className="text-xs text-emerald-300/70">Inventory, Intake, BOM Recipes & Manufacturing Execution</p>
          </div>
        </div>

        <nav className="flex items-center gap-1.5 bg-emerald-950/60 p-1.5 rounded-xl border border-emerald-500/20">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'inventory' 
                ? 'bg-emerald-500 text-[#06130e] shadow-md shadow-emerald-500/20' 
                : 'text-emerald-300 hover:text-emerald-100 hover:bg-emerald-900/30'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" /> Stock & Alerts
          </button>

          <button
            onClick={() => setActiveTab('suppliers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'suppliers' 
                ? 'bg-emerald-500 text-[#06130e] shadow-md shadow-emerald-500/20' 
                : 'text-emerald-300 hover:text-emerald-100 hover:bg-emerald-900/30'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Suppliers
          </button>

          <button
            onClick={() => setActiveTab('po')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'po' 
                ? 'bg-emerald-500 text-[#06130e] shadow-md shadow-emerald-500/20' 
                : 'text-emerald-300 hover:text-emerald-100 hover:bg-emerald-900/30'
            }`}
          >
            <Truck className="w-3.5 h-3.5" /> PO Ingestion
          </button>

          <button
            onClick={() => setActiveTab('recipes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'recipes' 
                ? 'bg-emerald-500 text-[#06130e] shadow-md shadow-emerald-500/20' 
                : 'text-emerald-300 hover:text-emerald-100 hover:bg-emerald-900/30'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> BOM Recipes
          </button>
        </nav>
      </div>

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
        <div className="flex flex-col items-center justify-center py-16 text-emerald-400 gap-3">
          <RefreshCw className="w-7 h-7 animate-spin" />
          <p className="text-sm font-semibold">Synchronizing with MongoDB...</p>
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
                        const current = Number(item.currentQuantity ?? item.quantity ?? item.currentBalance ?? 0);
                        const threshold = Number(item.safetyStockThreshold ?? item.safetyStock ?? 10);
                        const isLow = current <= threshold;

                        return (
                          <tr key={item._id || item.sku} className="hover:bg-emerald-900/20 transition">
                            <td className="py-4 px-6 font-semibold text-white">{item.itemName || item.name}</td>
                            <td className="py-4 px-6 text-emerald-400/80 font-mono text-xs">{item.sku}</td>
                            <td className="py-4 px-6 font-bold text-emerald-200">
                              {current} <span className="text-xs font-normal text-emerald-400">{item.unitOfMeasure || item.unit || 'kg'}</span>
                            </td>
                            <td className="py-4 px-6 text-emerald-300/80">{threshold} {item.unitOfMeasure || item.unit || 'kg'}</td>
                            <td className="py-4 px-6 text-emerald-300/70">{item.warehouseName || item.location || 'Main Warehouse'}</td>
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

// Universal Header
function UnifiedHeader() {
  const location = useLocation();
  const token = localStorage.getItem('intrack_token');

  // Hide the navigation header entirely on public auth pages
  const isAuthPage = ['/login', '/register'].some(p => location.pathname.startsWith(p)) || location.pathname.startsWith('/invite/');
  if (isAuthPage || !token) {
    return (
      <header className="mb-6 flex items-center justify-between p-4 rounded-2xl bg-[#141b18] border border-[rgba(255,255,255,0.08)] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              IN-Track <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Enterprise</span>
            </h1>
            <p className="text-xs text-[#8b968f]">Multi-Tenant Operations, Inventory & Financial Analytics</p>
          </div>
        </div>
      </header>
    );
  }

  const isModule1 = ['/dashboard', '/team', '/warehouses', '/categories', '/billing'].some(p => location.pathname.startsWith(p));
  const isModule2 = location.pathname.startsWith('/operations');
  const isModule3 = location.pathname.startsWith('/finance');

  return (
    <header className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#141b18] border border-[rgba(255,255,255,0.08)] shadow-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            IN-Track <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Enterprise</span>
          </h1>
          <p className="text-xs text-[#8b968f]">Multi-Tenant Operations, Inventory & Financial Analytics</p>
        </div>
      </div>

      <nav className="flex flex-wrap items-center gap-2 bg-[#0d1310] p-1.5 rounded-xl border border-[rgba(255,255,255,0.08)]">
        <Link
          to="/dashboard"
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            isModule1
              ? 'bg-emerald-500 text-[#06130e] shadow-md shadow-emerald-500/20'
              : 'text-[#8b968f] hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" /> Module 1: Platform
        </Link>

        <Link
          to="/operations"
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            isModule2
              ? 'bg-emerald-500 text-[#06130e] shadow-md shadow-emerald-500/20'
              : 'text-[#8b968f] hover:text-white'
          }`}
        >
          <Boxes className="w-4 h-4" /> Module 2: Operations
        </Link>

        <Link
          to="/finance"
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            isModule3
              ? 'bg-emerald-500 text-[#06130e] shadow-md shadow-emerald-500/20'
              : 'text-[#8b968f] hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Module 3: Finance
        </Link>

        <button
          onClick={() => {
            localStorage.removeItem('intrack_token');
            localStorage.removeItem('intrack_user');
            localStorage.removeItem('intrack_tenant');
            window.location.href = '/login';
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 cursor-pointer ml-2"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </nav>
    </header>
  );
}

// Sub-navigation for Module 1 Pages
function Module1SubNav() {
  const location = useLocation();
  const links = [
    { path: '/dashboard', label: 'Overview', icon: Building2 },
    { path: '/warehouses', label: 'Warehouses', icon: Boxes },
    { path: '/categories', label: 'Categories', icon: FolderTree },
    { path: '/team', label: 'Team', icon: Users },
    { path: '/billing', label: 'Billing & Plan', icon: CreditCard },
  ];

  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
      {links.map((tab) => {
        const Icon = tab.icon;
        const active = location.pathname === tab.path;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              active
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-[#8b968f] hover:text-white bg-[#141b18] border border-[rgba(255,255,255,0.05)]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

// Root Application
export default function App() {
  return (
    <TenantProvider>
      <Router>
        <div className="min-h-screen bg-[#0d1310] text-[#f3f5f4] p-4 md:p-6 max-w-7xl mx-auto">
          <UnifiedHeader />

          <Routes>
            {/* Public Authentication Gate */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterCompany />} />
            <Route path="/invite/:token" element={<AcceptInvite />} />

            {/* Root Route: Redirects to Operations if authenticated, otherwise to Login */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Navigate to="/operations" replace />
                </ProtectedRoute>
              }
            />

            {/* Module 2: Operations (Now Protected by Module 1 Auth) */}
            <Route
              path="/operations/*"
              element={
                <ProtectedRoute>
                  <Module2OperationsView />
                </ProtectedRoute>
              }
            />

            {/* Module 1: Platform & Tenant Administration */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Module1SubNav />
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/warehouses"
              element={
                <ProtectedRoute>
                  <Module1SubNav />
                  <Warehouses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <Module1SubNav />
                  <AssetCategories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team"
              element={
                <ProtectedRoute>
                  <Module1SubNav />
                  <TeamManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  <Module1SubNav />
                  <Billing />
                </ProtectedRoute>
              }
            />

            {/* Module 3: Finance & Analytics (Protected by Module 1 Auth) */}
            <Route
              path="/finance/*"
              element={
                <ProtectedRoute>
                  <div className="space-y-6">
                    <NeuNavbar />
                    <Routes>
                      <Route path="/" element={<FinanceDashboard />} />
                      <Route path="budget" element={<BudgetPage />} />
                      <Route path="expenses" element={<ExpensesPage />} />
                      <Route path="expenses/create" element={<ExpenseCreatePage />} />
                      <Route path="payables" element={<PayablesPage />} />
                      <Route path="analytics" element={<AnalyticsPage />} />
                      <Route path="settings" element={<CurrencySettingsPage />} />
                    </Routes>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </TenantProvider>
  );
}