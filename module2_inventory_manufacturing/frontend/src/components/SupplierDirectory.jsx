import React, { useState } from 'react';
import { Star, Clock, CheckCircle, Mail, Phone, Plus, UserPlus } from 'lucide-react';

export default function SupplierDirectory({ suppliers, onAddSupplier }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    leadTimeDays: 5,
    reliabilityRating: 5.0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddSupplier({ ...formData, _id: `sup_${Date.now()}`, fulfillmentRate: 99.0 });
    setShowModal(false);
    setFormData({ name: '', contactPerson: '', contactEmail: '', contactPhone: '', leadTimeDays: 5, reliabilityRating: 5.0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-emerald-50">Supplier & Vendor Directory</h2>
          <p className="text-xs text-emerald-300/60 mt-0.5">Manage trade partners, historical lead times & performance metrics</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-300 hover:bg-emerald-200 text-forest-950 font-semibold px-4 py-2 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-400/20 transition-all duration-200"
        >
          <Plus className="w-4 h-4" /> Add New Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {suppliers.map((s) => (
          <div key={s._id} className="glass-panel p-5 rounded-3xl border border-emerald-500/20 relative group hover:border-emerald-400/40 transition">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-serif text-lg font-semibold text-emerald-100">{s.name}</h3>
                <p className="text-xs text-emerald-300/70">{s.contactPerson}</p>
              </div>
              <div className="flex items-center gap-1 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-400/20 text-amber-300 text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                {s.reliabilityRating.toFixed(1)}
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-emerald-200/80 my-4">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400" /> {s.contactEmail}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> {s.contactPhone}
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-900/40 grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-300/80 bg-forest-950/50 p-2 rounded-xl">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Lead Time: <strong>{s.leadTimeDays}d</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-300/80 bg-forest-950/50 p-2 rounded-xl">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Fulfillment: <strong>{s.fulfillmentRate}%</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Supplier Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/80 backdrop-blur-md">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-emerald-400/30">
            <h3 className="font-serif text-xl text-emerald-100 mb-4">Register New Supplier Partner</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-emerald-300/80 block mb-1">Company Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="glass-input w-full p-2.5 rounded-xl"
                  placeholder="e.g. Apex Industrial Fabrics Ltd"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-emerald-300/80 block mb-1">Contact Person</label>
                  <input
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="glass-input w-full p-2.5 rounded-xl"
                    placeholder="e.g. Rafiqul Islam"
                  />
                </div>
                <div>
                  <label className="text-emerald-300/80 block mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    value={formData.leadTimeDays}
                    onChange={(e) => setFormData({ ...formData, leadTimeDays: Number(e.target.value) })}
                    className="glass-input w-full p-2.5 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="text-emerald-300/80 block mb-1">Email</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="glass-input w-full p-2.5 rounded-xl"
                  placeholder="vendor@mail.com"
                />
              </div>
              <div>
                <label className="text-emerald-300/80 block mb-1">Phone</label>
                <input
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="glass-input w-full p-2.5 rounded-xl"
                  placeholder="+880 1..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-emerald-300/60 hover:text-emerald-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-300 text-forest-950 font-semibold px-5 py-2 rounded-xl hover:bg-emerald-200"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}