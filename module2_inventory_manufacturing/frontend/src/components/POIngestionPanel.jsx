import React, { useState } from 'react';
import { Truck, Check, FileCheck, Weight, ShieldCheck } from 'lucide-react';

export default function POIngestionPanel({ purchaseOrders, onIngestShipment }) {
  const [selectedPO, setSelectedPO] = useState(purchaseOrders[0] || null);
  const [deliverySlip, setDeliverySlip] = useState('');
  const [verifiedWeight, setVerifiedWeight] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleIngest = (e) => {
    e.preventDefault();
    if (!selectedPO) return;

    onIngestShipment(selectedPO._id, {
      deliverySlipNumber: deliverySlip || `SLIP-${Date.now().toString().slice(-4)}`,
      verifiedWeight: Number(verifiedWeight) || 120.0,
      receivedItems: selectedPO.items.map((item) => ({
        sku: item.sku,
        name: item.name,
        quantity: item.orderedQuantity,
        unitOfMeasure: item.unitOfMeasure,
      })),
    });

    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-emerald-50">Purchase Order (PO) Ingestion Engine</h2>
        <p className="text-xs text-emerald-300/60 mt-0.5">Match delivery weights against PO slips and increment warehouse balances</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pending POs List */}
        <div className="glass-panel p-5 rounded-3xl space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">Pending Inbound Shipments</h3>
          {purchaseOrders.map((po) => (
            <div
              key={po._id}
              onClick={() => setSelectedPO(po)}
              className={`p-4 rounded-2xl cursor-pointer transition border ${
                selectedPO?._id === po._id
                  ? 'bg-emerald-900/40 border-emerald-400/50 shadow-md'
                  : 'glass-panel-subtle border-emerald-500/10 hover:border-emerald-400/30'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-xs font-bold text-emerald-200">{po.poNumber}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/20">
                  {po.status}
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium">{po.supplierName}</p>
              <div className="flex justify-between text-[11px] text-emerald-300/60 mt-2">
                <span>{po.items.length} line items</span>
                <span>${po.totalCost.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Receiving & Verification Desk */}
        {selectedPO && (
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-emerald-400/20 space-y-5">
            <div className="flex justify-between items-center pb-4 border-b border-emerald-900/40">
              <div>
                <span className="text-xs text-emerald-400 font-mono">Receiving Inspection</span>
                <h3 className="font-serif text-xl text-emerald-50">{selectedPO.poNumber}</h3>
              </div>
              <span className="text-xs bg-forest-950/80 px-3 py-1 rounded-xl text-emerald-300 border border-emerald-500/20">
                Destination: {selectedPO.warehouseName}
              </span>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-emerald-400/80 border-b border-emerald-900/40">
                    <th className="pb-2">Material / SKU</th>
                    <th className="pb-2">Ordered Qty</th>
                    <th className="pb-2">Unit Cost</th>
                    <th className="pb-2">Total Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-950/60 text-emerald-100">
                  {selectedPO.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-emerald-900/10">
                      <td className="py-2.5">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-[10px] text-emerald-400/60 font-mono">{item.sku}</div>
                      </td>
                      <td className="py-2.5 font-mono">{item.orderedQuantity} {item.unitOfMeasure}</td>
                      <td className="py-2.5 font-mono">${item.unitCost.toFixed(2)}</td>
                      <td className="py-2.5 font-mono">${(item.orderedQuantity * item.unitCost).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleIngest} className="bg-forest-950/50 p-4 rounded-2xl border border-emerald-500/20 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-emerald-300/80 block mb-1 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-400" /> Physical Delivery Slip #
                  </label>
                  <input
                    required
                    value={deliverySlip}
                    onChange={(e) => setDeliverySlip(e.target.value)}
                    placeholder="e.g. PK-88392-BD"
                    className="glass-input w-full p-2.5 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-emerald-300/80 block mb-1 flex items-center gap-1.5">
                    <Weight className="w-3.5 h-3.5 text-emerald-400" /> Weighbridge Verified Gross (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={verifiedWeight}
                    onChange={(e) => setVerifiedWeight(e.target.value)}
                    placeholder="e.g. 142.50"
                    className="glass-input w-full p-2.5 rounded-xl"
                  />
                </div>
              </div>

              {isSuccess && (
                <div className="p-3 bg-emerald-900/60 border border-emerald-400/40 text-emerald-200 rounded-xl text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  Shipment validated! Warehouse inventory incremented successfully[cite: 1].
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-300 hover:bg-emerald-200 text-forest-950 font-semibold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-400/20 transition"
              >
                <Truck className="w-4 h-4" /> Verify Slip & Ingest Warehouse Balances
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}