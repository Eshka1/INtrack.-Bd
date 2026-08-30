import React, { useState } from 'react';
import { Building2, Plus, Trash2, Star, Clock, Mail, CheckCircle2 } from 'lucide-react';

export default function SupplierDirectory({ suppliers = [], onAddSupplier, onDeleteSupplier }) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [leadTimeDays, setLeadTimeDays] = useState(3);
  const [products, setProducts] = useState([
    { name: '', sku: '', unit: 'spools', unitPrice: '' }
  ]);

  const handleAddProductRow = () => {
    setProducts([...products, { name: '', sku: '', unit: 'units', unitPrice: '' }]);
  };

  const handleRemoveProductRow = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleProductChange = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validProducts = products.filter(p => p.name.trim() && p.unitPrice !== '');
    if (!name.trim()) {
      alert('Please enter a supplier name.');
      return;
    }

    const newSupplier = {
      _id: `sup_${Date.now()}`,
      name,
      contactEmail: contactEmail || 'N/A',
      leadTimeDays: Number(leadTimeDays) || 3,
      reliabilityScore: 5.0,
      products: validProducts.map(p => ({
        name: p.name,
        sku: p.sku || `SKU-${Math.floor(100 + Math.random() * 900)}`,
        unit: p.unit || 'units',
        unitPrice: parseFloat(p.unitPrice) || 0
      }))
    };

    if (onAddSupplier) {
      onAddSupplier(newSupplier);
    }

    setShowModal(false);
    setName('');
    setContactEmail('');
    setLeadTimeDays(3);
    setProducts([{ name: '', sku: '', unit: 'units', unitPrice: '' }]);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-emerald-950/40 border border-emerald-500/20 backdrop-blur-md rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-emerald-300">Supplier & Catalog Directory</h2>
            <p className="text-sm text-emerald-200/70">Manage vendor profiles and their active product catalogs with unit pricing.</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#06130e] font-semibold rounded-xl flex items-center gap-2 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Register New Supplier
        </button>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((s) => {
          const supplierId = s._id || s.id;
          return (
            <div key={supplierId} className="bg-emerald-950/30 border border-emerald-500/20 backdrop-blur-md rounded-2xl p-5 space-y-4 shadow-lg hover:border-emerald-500/40 transition flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-emerald-100 text-lg">{s.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-300/70 mt-1">
                      <Mail className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{s.contactEmail || 'No contact email'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" /> {s.reliabilityScore ?? 5.0}
                    </span>
                    {onDeleteSupplier && (
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to remove ${s.name}?`)) {
                            onDeleteSupplier(supplierId);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition cursor-pointer"
                        title="Remove Supplier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-300/90">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Standard Lead Time: <strong>{s.leadTimeDays ?? 3} days</strong></span>
                </div>

                {/* Supplied Products List */}
                <div className="border-t border-emerald-500/20 pt-3 space-y-2">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Supplied Catalog:</span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {(s.products && s.products.length > 0) ? (
                      s.products.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs bg-[#06130e]/70 px-3 py-2 rounded-xl border border-emerald-500/15">
                          <div>
                            <span className="text-emerald-100 font-medium block">{p.name}</span>
                            {p.sku && <span className="text-[10px] text-emerald-400/60 font-mono">{p.sku}</span>}
                          </div>
                          <span className="text-emerald-300 font-bold bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-500/20">
                            ${p.unitPrice ?? 0} / {p.unit || 'unit'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-emerald-400/50 italic py-1">No products registered yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#06130e] border border-emerald-500/30 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-emerald-300">Register Supplier & Catalog Items</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1 md:col-span-1">
                  <label className="text-xs text-emerald-400 font-semibold">Vendor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Mill Ltd."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-3 py-2 text-sm text-emerald-100 focus:outline-none focus:border-emerald-400"
                    required
                  />
                </div>
                <div className="space-y-1 md:col-span-1">
                  <label className="text-xs text-emerald-400 font-semibold">Contact Email</label>
                  <input
                    type="email"
                    placeholder="orders@vendor.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-3 py-2 text-sm text-emerald-100 focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="space-y-1 md:col-span-1">
                  <label className="text-xs text-emerald-400 font-semibold">Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={leadTimeDays}
                    onChange={(e) => setLeadTimeDays(e.target.value)}
                    className="w-full bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-3 py-2 text-sm text-emerald-100 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Product Catalog Entries */}
              <div className="space-y-3 pt-3 border-t border-emerald-500/20">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase text-emerald-400">Products Sold & Contract Price</label>
                  <button
                    type="button"
                    onClick={handleAddProductRow}
                    className="text-xs text-emerald-300 hover:text-emerald-100 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Another Product
                  </button>
                </div>

                {products.map((p, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/20">
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={p.name}
                      onChange={(e) => handleProductChange(idx, 'name', e.target.value)}
                      className="col-span-4 bg-[#06130e] border border-emerald-500/30 rounded-lg px-2.5 py-1.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                      required
                    />
                    <input
                      type="text"
                      placeholder="SKU"
                      value={p.sku}
                      onChange={(e) => handleProductChange(idx, 'sku', e.target.value)}
                      className="col-span-3 bg-[#06130e] border border-emerald-500/30 rounded-lg px-2.5 py-1.5 text-xs text-emerald-100 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Unit (e.g. kg)"
                      value={p.unit}
                      onChange={(e) => handleProductChange(idx, 'unit', e.target.value)}
                      className="col-span-2 bg-[#06130e] border border-emerald-500/30 rounded-lg px-2 py-1.5 text-xs text-emerald-100 focus:outline-none"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price ($)"
                      value={p.unitPrice}
                      onChange={(e) => handleProductChange(idx, 'unitPrice', e.target.value)}
                      className="col-span-2 bg-[#06130e] border border-emerald-500/30 rounded-lg px-2 py-1.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                      required
                    />
                    <button
                      type="button"
                      disabled={products.length === 1}
                      onClick={() => handleRemoveProductRow(idx)}
                      className="col-span-1 text-red-400 hover:text-red-300 disabled:opacity-20 flex justify-center cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-emerald-500/20">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-emerald-300 hover:bg-emerald-950 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm bg-emerald-500 hover:bg-emerald-400 text-[#06130e] font-semibold rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Save Supplier & Products
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}