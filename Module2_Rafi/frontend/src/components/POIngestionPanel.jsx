import React, { useState } from 'react';
import { Truck, CheckCircle2, DollarSign, Building2, Package, Lock } from 'lucide-react';

export default function POIngestionPanel({ suppliers, onIngestPO }) {
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantityReceived, setQuantityReceived] = useState('');
  const [location, setLocation] = useState('Main Warehouse Dock');
  const [successMsg, setSuccessMsg] = useState(false);

  // Active supplier object based on user selection
  const currentSupplier = suppliers.find((s) => (s._id || s.id) === selectedSupplierId);
  const supplierProducts = currentSupplier?.products || [];

  // Automatically locked unit cost directly derived from supplier catalog
  const unitCost = Number(selectedProduct?.unitPrice || 0);
  const qty = Number(quantityReceived) || 0;
  const totalCost = Number((qty * unitCost).toFixed(2));

  // Reset selection when supplier changes
  const handleSupplierChange = (e) => {
    const sId = e.target.value;
    setSelectedSupplierId(sId);
    setSelectedProduct(null);
    setQuantityReceived('');
  };

  // Populate product details, SKU, unit, and auto unit price
  const handleProductChange = (e) => {
    const pName = e.target.value;
    const prod = supplierProducts.find((p) => p.name === pName);
    setSelectedProduct(prod || null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSupplierId || !selectedProduct || qty <= 0) return;

    onIngestPO({
      supplierId: currentSupplier._id || currentSupplier.id,
      supplierName: currentSupplier.name,
      productName: selectedProduct.name,
      sku: selectedProduct.sku,
      quantityReceived: qty,
      unitCost: unitCost,
      totalCost: totalCost,
      unit: selectedProduct.unit || 'units',
      location
    });

    setSuccessMsg(true);
    setQuantityReceived('');
    setSelectedProduct(null);
    setSelectedSupplierId('');

    setTimeout(() => setSuccessMsg(false), 3500);
  };

  return (
    <div className="max-w-2xl mx-auto bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-8 backdrop-blur-xl shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
          <Truck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Purchase Order Goods Ingestion</h2>
          <p className="text-xs text-emerald-300/70">
            Source items from registered suppliers, calculate procurement costs, and update stock.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-emerald-300 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Purchase order intake recorded! Material balance synchronized to MongoDB.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Supplier Selector */}
        <div>
          <label className="block text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" /> Select Supplier
          </label>
          <select
            required
            value={selectedSupplierId}
            onChange={handleSupplierChange}
            className="w-full bg-[#071d15] text-emerald-100 border border-emerald-500/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 cursor-pointer"
          >
            <option value="" className="bg-[#071d15] text-emerald-400/60 py-2">
              -- Choose a Vetted Supplier --
            </option>
            {suppliers.map((s) => (
              <option key={s._id || s.id} value={s._id || s.id} className="bg-[#071d15] text-white py-2">
                {s.name} ({s.leadTimeDays || 3}d lead time)
              </option>
            ))}
          </select>
        </div>

        {/* Product Selector */}
        <div>
          <label className="block text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" /> Select Supplier Catalog Product
          </label>
          <select
            required
            disabled={!selectedSupplierId || supplierProducts.length === 0}
            value={selectedProduct?.name || ''}
            onChange={handleProductChange}
            className={`w-full bg-[#071d15] text-emerald-100 border border-emerald-500/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 ${
              !selectedSupplierId || supplierProducts.length === 0
                ? 'opacity-50 cursor-not-allowed text-emerald-400/40'
                : 'cursor-pointer'
            }`}
          >
            <option value="" className="bg-[#071d15] text-emerald-400/60 py-2">
              {!selectedSupplierId
                ? 'Select a supplier above first'
                : supplierProducts.length === 0
                ? 'No catalog items listed under this supplier'
                : '-- Choose Material to Purchase --'}
            </option>
            {supplierProducts.map((p, idx) => (
              <option key={idx} value={p.name} className="bg-[#071d15] text-white py-2">
                {p.name} {p.sku ? `(${p.sku})` : ''} — ${p.unitPrice?.toFixed(2) || '0.00'}/{p.unit || 'unit'}
              </option>
            ))}
          </select>
        </div>

        {/* SKU Display & Quantity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-emerald-400 mb-1">SKU Code</label>
            <input
              type="text"
              readOnly
              value={selectedProduct?.sku || 'Auto-populated'}
              className="w-full bg-[#04110c] border border-emerald-500/20 rounded-xl px-4 py-2 text-sm text-emerald-300 font-mono focus:outline-none cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-400 mb-1">Quantity Received</label>
            <div className="flex">
              <input
                type="number"
                required
                min="0.1"
                step="any"
                value={quantityReceived}
                onChange={(e) => setQuantityReceived(e.target.value)}
                placeholder="e.g. 50"
                className="w-full bg-[#071d15] border border-emerald-500/40 rounded-l-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-400 font-bold"
              />
              <span className="inline-flex items-center px-3 bg-emerald-900/50 border border-l-0 border-emerald-500/40 rounded-r-xl text-xs text-emerald-300 font-medium">
                {selectedProduct?.unit || 'units'}
              </span>
            </div>
          </div>
        </div>

        {/* Automatic Unit Cost & Storage Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-emerald-400 mb-1 flex items-center justify-between">
              <span>Unit Purchase Cost ($)</span>
              <span className="text-[10px] text-emerald-400/60 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Locked to Supplier Rate
              </span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-emerald-400 text-xs">$</span>
              <input
                type="text"
                readOnly
                value={selectedProduct ? unitCost.toFixed(2) : '0.00'}
                className="w-full bg-[#04110c] border border-emerald-500/20 rounded-xl pl-8 pr-4 py-2 text-sm text-emerald-300 font-mono focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-400 mb-1">Storage Destination</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[#071d15] border border-emerald-500/40 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
            />
          </div>
        </div>

        {/* Total Cost Summary Card */}
        {selectedProduct && qty > 0 && (
          <div className="p-4 bg-[#071d15] border border-emerald-500/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-300 text-xs">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>
                Calculated Total Order Cost ({qty} {selectedProduct.unit || 'units'} @ ${unitCost.toFixed(2)}):
              </span>
            </div>
            <span className="text-base font-bold text-white font-mono">
              ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedSupplierId || !selectedProduct || qty <= 0}
          className={`w-full py-3 rounded-xl font-bold transition cursor-pointer shadow-lg shadow-emerald-500/20 ${
            selectedSupplierId && selectedProduct && qty > 0
              ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
              : 'bg-emerald-950 text-emerald-500/30 cursor-not-allowed border border-emerald-500/10'
          }`}
        >
          Confirm Purchase Order & Add to Ledger
        </button>
      </form>
    </div>
  );
}