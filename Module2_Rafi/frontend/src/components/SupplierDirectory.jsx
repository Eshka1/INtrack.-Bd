import React, { useState } from 'react';
import { Users, Plus, Trash2, Mail, Clock, Star, Package, Tag, AlertCircle, Edit3, X, Check } from 'lucide-react';

export default function SupplierDirectory({ suppliers, onAddSupplier, onUpdateSupplier, onDeleteSupplier }) {
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    leadTimeDays: 3,
    reliabilityScore: 5.0,
    products: []
  });

  const [productInput, setProductInput] = useState({
    name: '',
    sku: '',
    unitPrice: '',
    unit: ''
  });

  // State for adding a product while in Edit mode
  const [editProductInput, setEditProductInput] = useState({
    name: '',
    sku: '',
    unitPrice: '',
    unit: ''
  });

  const handleAddProduct = () => {
    if (!productInput.name.trim()) return;

    const newProd = {
      name: productInput.name.trim(),
      sku: productInput.sku.trim() || `RAW-${Math.floor(100 + Math.random() * 900)}`,
      unitPrice: Number(productInput.unitPrice) || 0,
      unit: productInput.unit.trim().toLowerCase() || 'units'
    };

    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, newProd]
    }));

    setProductInput({ name: '', sku: '', unitPrice: '', unit: '' });
  };

  const handleRemovePendingProduct = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    let finalProducts = [...formData.products];
    if (productInput.name.trim()) {
      finalProducts.push({
        name: productInput.name.trim(),
        sku: productInput.sku.trim() || `RAW-${Math.floor(100 + Math.random() * 900)}`,
        unitPrice: Number(productInput.unitPrice) || 0,
        unit: productInput.unit.trim().toLowerCase() || 'units'
      });
    }

    onAddSupplier({
      name: formData.name.trim(),
      contactEmail: formData.contactEmail.trim() || 'N/A',
      leadTimeDays: Number(formData.leadTimeDays) || 3,
      reliabilityScore: Number(formData.reliabilityScore) || 5.0,
      products: finalProducts
    });

    setFormData({
      name: '',
      contactEmail: '',
      leadTimeDays: 3,
      reliabilityScore: 5.0,
      products: []
    });
    setProductInput({ name: '', sku: '', unitPrice: '', unit: '' });
    setShowForm(false);
  };

  // --- EDIT CATALOG MODAL HANDLERS ---
  const handleOpenEdit = (supplier) => {
    setEditingSupplier(JSON.parse(JSON.stringify(supplier)));
    setEditProductInput({ name: '', sku: '', unitPrice: '', unit: '' });
  };

  const handleAddEditProduct = () => {
    if (!editProductInput.name.trim()) return;

    const newProd = {
      name: editProductInput.name.trim(),
      sku: editProductInput.sku.trim() || `RAW-${Math.floor(100 + Math.random() * 900)}`,
      unitPrice: Number(editProductInput.unitPrice) || 0,
      unit: editProductInput.unit.trim().toLowerCase() || 'units'
    };

    setEditingSupplier((prev) => ({
      ...prev,
      products: [...(prev.products || []), newProd]
    }));

    setEditProductInput({ name: '', sku: '', unitPrice: '', unit: '' });
  };

  const handleRemoveEditProduct = (indexToRemove) => {
    setEditingSupplier((prev) => ({
      ...prev,
      products: prev.products.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSaveSupplierEdit = () => {
    if (!editingSupplier) return;

    let updatedProducts = [...(editingSupplier.products || [])];
    if (editProductInput.name.trim()) {
      updatedProducts.push({
        name: editProductInput.name.trim(),
        sku: editProductInput.sku.trim() || `RAW-${Math.floor(100 + Math.random() * 900)}`,
        unitPrice: Number(editProductInput.unitPrice) || 0,
        unit: editProductInput.unit.trim().toLowerCase() || 'units'
      });
    }

    onUpdateSupplier(editingSupplier._id, {
      ...editingSupplier,
      products: updatedProducts
    });

    setEditingSupplier(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-emerald-300">Supplier Directory & Unit Pricing Catalog</h2>
          <p className="text-sm text-emerald-200/70">Manage supplier contracts, catalog items, and baseline price-per-unit metrics.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" /> {showForm ? 'Close Form' : 'Add New Supplier'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-emerald-950/60 border border-emerald-500/30 p-6 rounded-2xl space-y-6 backdrop-blur-xl shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">Company / Mill Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#071d15] border border-emerald-500/30 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                placeholder="e.g. Apex Textile Mills"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full bg-[#071d15] border border-emerald-500/30 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                placeholder="procurement@apex.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">Standard Delivery Lead Time (Days)</label>
              <input
                type="number"
                min="1"
                value={formData.leadTimeDays}
                onChange={(e) => setFormData({ ...formData, leadTimeDays: e.target.value })}
                className="w-full bg-[#071d15] border border-emerald-500/30 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">Reliability Rating (1.0 to 5.0)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={formData.reliabilityScore}
                onChange={(e) => setFormData({ ...formData, reliabilityScore: e.target.value })}
                className="w-full bg-[#071d15] border border-emerald-500/30 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div className="border-t border-emerald-500/20 pt-5 space-y-3">
            <div>
              <h4 className="text-xs font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Supplier Catalog: Products, SKUs & Price-per-Unit
              </h4>
              <p className="text-[11px] text-emerald-300/60">Type any custom unit of measurement (e.g. meter, kg, rolls, yards).</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-[#071d15]/80 p-4 rounded-xl border border-emerald-500/20">
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-semibold text-emerald-400/80 mb-1">Raw Material Name</label>
                <input
                  type="text"
                  placeholder="e.g. Poly Thread Spool"
                  value={productInput.name}
                  onChange={(e) => setProductInput({ ...productInput, name: e.target.value })}
                  className="w-full bg-[#04110c] border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-semibold text-emerald-400/80 mb-1">SKU Code</label>
                <input
                  type="text"
                  placeholder="RAW-POL-001"
                  value={productInput.sku}
                  onChange={(e) => setProductInput({ ...productInput, sku: e.target.value })}
                  className="w-full bg-[#04110c] border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-emerald-400/80 mb-1">Unit of Measure</label>
                <input
                  type="text"
                  placeholder="e.g. meters, kg, rolls"
                  value={productInput.unit}
                  onChange={(e) => setProductInput({ ...productInput, unit: e.target.value })}
                  className="w-full bg-[#04110c] border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-emerald-400/80 mb-1">Price / Unit ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="4.50"
                  value={productInput.unitPrice}
                  onChange={(e) => setProductInput({ ...productInput, unitPrice: e.target.value })}
                  className="w-full bg-[#04110c] border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="sm:col-span-1 flex items-end">
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center justify-center transition cursor-pointer shadow-md"
                  title="Stage Material"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {formData.products.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <p className="text-[11px] font-semibold text-emerald-400">Items ready to be saved with this supplier:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.products.map((p, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 text-xs px-3 py-1.5 bg-[#071d15] border border-emerald-500/40 rounded-xl text-emerald-200"
                    >
                      <Package className="w-3.5 h-3.5 text-emerald-400" />
                      <strong>{p.name}</strong> ({p.sku}) —
                      <span className="text-emerald-400 font-mono font-bold">${Number(p.unitPrice).toFixed(2)}</span> / {p.unit}
                      <button
                        type="button"
                        onClick={() => handleRemovePendingProduct(idx)}
                        className="text-red-400 hover:text-red-300 ml-1 cursor-pointer font-bold text-sm"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            Save Supplier & Catalog to MongoDB
          </button>
        </form>
      )}

      {/* Grid of registered suppliers */}
      {suppliers.length === 0 ? (
        <div className="bg-emerald-950/20 border border-emerald-500/10 rounded-2xl p-12 text-center text-emerald-400/60">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="font-semibold text-sm">No suppliers registered in the database yet.</p>
          <p className="text-xs text-emerald-400/40 mt-1">Click "Add New Supplier" above to create your first vendor and item catalog.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suppliers.map((s) => (
            <div key={s._id || s.name} className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-6 relative group hover:border-emerald-500/40 transition">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(s)}
                  className="p-1.5 text-emerald-400 hover:text-white hover:bg-emerald-500/20 rounded-lg transition cursor-pointer"
                  title="Edit Supplier Catalog"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteSupplier(s._id)}
                  className="p-1.5 text-emerald-500/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                  title="Delete Supplier"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 pr-16">{s.name}</h3>
              <div className="space-y-1.5 text-xs text-emerald-300/80 mb-4">
                <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-emerald-400" /> {s.contactEmail || 'No contact email listed'}</p>
                <p className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-emerald-400" /> {s.leadTimeDays} days transit lead time</p>
                <p className="flex items-center gap-2"><Star className="w-3.5 h-3.5 text-yellow-400" /> {s.reliabilityScore} / 5.0 Vendor Reliability Rating</p>
              </div>

              <div className="border-t border-emerald-500/15 pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">Catalog & Price-Per-Unit:</span>
                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                  >
                    + Add More Products
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(s.products) && s.products.length > 0 ? (
                    s.products.map((p, i) => (
                      <div key={i} className="text-xs px-2.5 py-1 bg-[#071d15] border border-emerald-500/20 rounded-lg text-emerald-200 flex items-center gap-1.5">
                        <span className="font-medium text-white">{p.name}:</span>
                        <span className="text-emerald-400 font-mono font-bold">${Number(p.unitPrice).toFixed(2)}</span>
                        <span className="text-emerald-400/70 text-[11px]">/ {p.unit || 'units'}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-amber-400/70 italic flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> No catalog items listed under this vendor
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- EDIT SUPPLIER CATALOG MODAL --- */}
      {editingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-[#0a1e17] border border-emerald-500/30 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-emerald-500/20 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-emerald-400" /> Edit Catalog: {editingSupplier.name}
                </h3>
                <p className="text-xs text-emerald-300/70">Add new products or remove existing items from this supplier.</p>
              </div>
              <button
                onClick={() => setEditingSupplier(null)}
                className="text-emerald-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Products List with Delete X */}
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-2">Existing Catalog Products</label>
              {editingSupplier.products && editingSupplier.products.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {editingSupplier.products.map((p, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 text-xs px-3 py-1.5 bg-[#071d15] border border-emerald-500/40 rounded-xl text-emerald-200"
                    >
                      <Package className="w-3.5 h-3.5 text-emerald-400" />
                      <strong>{p.name}</strong> ({p.sku}) —
                      <span className="text-emerald-400 font-mono font-bold">${Number(p.unitPrice).toFixed(2)}</span> / {p.unit}
                      <button
                        type="button"
                        onClick={() => handleRemoveEditProduct(idx)}
                        className="text-red-400 hover:text-red-300 ml-1 cursor-pointer font-bold text-sm"
                        title="Remove product"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-amber-400/80 italic">No products currently listed.</p>
              )}
            </div>

            {/* Form to Add an Extra Product */}
            <div className="border-t border-emerald-500/20 pt-4 space-y-2">
              <label className="block text-xs font-semibold text-emerald-400">Add New Product to Catalog</label>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <input
                  type="text"
                  placeholder="Material name"
                  value={editProductInput.name}
                  onChange={(e) => setEditProductInput({ ...editProductInput, name: e.target.value })}
                  className="sm:col-span-4 bg-[#071d15] border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="SKU"
                  value={editProductInput.sku}
                  onChange={(e) => setEditProductInput({ ...editProductInput, sku: e.target.value })}
                  className="sm:col-span-3 bg-[#071d15] border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Unit (kg, m)"
                  value={editProductInput.unit}
                  onChange={(e) => setEditProductInput({ ...editProductInput, unit: e.target.value })}
                  className="sm:col-span-2 bg-[#071d15] border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={editProductInput.unitPrice}
                  onChange={(e) => setEditProductInput({ ...editProductInput, unitPrice: e.target.value })}
                  className="sm:col-span-2 bg-[#071d15] border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddEditProduct}
                  className="sm:col-span-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer shadow-md"
                  title="Stage Extra Product"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 pt-3 border-t border-emerald-500/20">
              <button
                type="button"
                onClick={() => setEditingSupplier(null)}
                className="flex-1 py-2.5 bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSupplierEdit}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Save Updated Catalog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}