import React, { useState } from 'react';
import { PackagePlus, FileText, CheckCircle2, Truck, Scale, Building2, DollarSign } from 'lucide-react';

export default function POIngestionPanel({ suppliers = [], onIngestPO }) {
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedProductSku, setSelectedProductSku] = useState('');
  const [quantity, setQuantity] = useState('');
  const [slipNumber, setSlipNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Find active supplier and their dynamic product catalog
  const activeSupplier = suppliers.find(s => (s._id || s.id) === selectedSupplierId);
  const availableProducts = activeSupplier?.products || [];
  const activeProduct = availableProducts.find(p => p.sku === selectedProductSku || p.name === selectedProductSku);

  const unitPrice = activeProduct?.unitPrice || 0;
  const unit = activeProduct?.unit || 'units';
  const totalCost = (parseFloat(quantity) || 0) * unitPrice;

  const handleSupplierChange = (e) => {
    setSelectedSupplierId(e.target.value);
    setSelectedProductSku(''); // Reset product when supplier changes
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activeSupplier || !activeProduct || !quantity || !slipNumber) {
      alert('Please select supplier, product, quantity, and enter delivery slip number.');
      return;
    }

    const payload = {
      poNumber: `PO-${Math.floor(100000 + Math.random() * 900000)}`,
      supplier: activeSupplier.name,
      productName: activeProduct.name,
      sku: activeProduct.sku,
      unitPrice,
      quantityReceived: parseFloat(quantity),
      totalCost,
      unit,
      slipNumber,
      notes,
      receivedAt: new Date().toISOString()
    };

    if (onIngestPO) onIngestPO(payload);

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setSlipNumber('');
      setQuantity('');
      setNotes('');
      setSelectedProductSku('');
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-emerald-950/40 border border-emerald-500/20 backdrop-blur-md rounded-2xl p-6 flex items-start gap-4">
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
          <Truck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-emerald-300">Purchase Order Ingestion & Weighbridge Intake</h2>
          <p className="text-sm text-emerald-200/70">
            Select a vendor to dynamically view their catalog products and contracted prices.
          </p>
        </div>
      </div>

      {isSuccess && (
        <div className="bg-emerald-500/20 border border-emerald-400/50 rounded-xl p-4 flex items-center gap-3 text-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>Shipment verified! Stock incremented and purchase order fulfilled.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-emerald-950/30 border border-emerald-500/20 backdrop-blur-xl rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Supplier Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              1. Select Supplier
            </label>
            <select
              value={selectedSupplierId}
              onChange={handleSupplierChange}
              className="w-full bg-[#06130e]/80 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-sm text-emerald-100 focus:outline-none focus:border-emerald-400"
              required
            >
              <option value="">Choose Supplier...</option>
              {suppliers.map((s) => (
                <option key={s._id || s.id} value={s._id || s.id}>
                  {s.name} ({s.products?.length || 0} catalog items)
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Product Dropdown (Filtered by Supplier) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
              <PackagePlus className="w-4 h-4 text-emerald-400" />
              2. Select Product from Supplier Catalog
            </label>
            <select
              value={selectedProductSku}
              onChange={(e) => setSelectedProductSku(e.target.value)}
              disabled={!selectedSupplierId || availableProducts.length === 0}
              className="w-full bg-[#06130e]/80 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-sm text-emerald-100 focus:outline-none focus:border-emerald-400 disabled:opacity-40"
              required
            >
              <option value="">
                {!selectedSupplierId 
                  ? 'First select a supplier above...' 
                  : availableProducts.length === 0 
                    ? 'No products registered for this supplier' 
                    : 'Choose catalog item...'}
              </option>
              {availableProducts.map((p) => (
                <option key={p.sku || p.name} value={p.sku || p.name}>
                  {p.name} — ${p.unitPrice}/{p.unit}
                </option>
              ))}
            </select>
          </div>

          {/* Delivery Slip */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Delivery Slip / Chalan #
            </label>
            <input
              type="text"
              value={slipNumber}
              onChange={(e) => setSlipNumber(e.target.value)}
              placeholder="e.g. CHALAN-2026-8801"
              className="w-full bg-[#06130e]/80 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-sm text-emerald-100 focus:outline-none focus:border-emerald-400"
              required
            />
          </div>

          {/* Quantity Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              Verified Received Quantity
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="any"
                min="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 100"
                className="w-full bg-[#06130e]/80 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-sm text-emerald-100 focus:outline-none focus:border-emerald-400"
                required
              />
              <span className="inline-flex items-center px-4 rounded-xl bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 text-sm">
                {unit}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Summary Card */}
        {activeProduct && (
          <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4 flex justify-between items-center text-sm">
            <div>
              <span className="text-emerald-400 font-semibold">Unit Price: </span>
              <span className="text-emerald-200">${unitPrice} per {unit}</span>
            </div>
            <div>
              <span className="text-emerald-400 font-semibold">Calculated Total: </span>
              <span className="text-emerald-100 font-bold text-base">${totalCost.toFixed(2)}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#06130e] shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          Verify Delivery Slip & Ingest into Inventory
        </button>
      </form>
    </div>
  );
}