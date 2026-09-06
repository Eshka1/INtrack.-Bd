import { useState, useEffect, useCallback } from "react";
import { fetchPayables, getPayableAging, createPayable, recordPayment } from "../services/financeApi";
import NeuCard from "../components/ui/NeuCard";
import NeuInput from "../components/ui/NeuInput";
import NeuButton from "../components/ui/NeuButton";
import NeuBadge from "../components/ui/NeuBadge";

const emptyForm = {
  supplierName: "",
  invoiceNumber: "",
  purchaseOrderNumber: "",
  totalAmount: "",
  currency: "BDT",
  issueDate: new Date().toISOString().split("T")[0],
  dueDate: "",
};

function agingVariant(group) {
  if (group === "Paid") return "paid";
  if (group === "Not Due") return "neutral";
  if (group === "1–30 Days Overdue") return "partial";
  return "overdue";
}

const PayablesPage = () => {
  const [payables, setPayables] = useState([]);
  const [aging, setAging] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [payModal, setPayModal] = useState(null); // payable being paid
  const [payAmount, setPayAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, agingRes] = await Promise.all([fetchPayables(), getPayableAging()]);
      setPayables(listRes.data.data || []);
      setAging(agingRes.data.data || null);
    } catch (err) {
      console.error("Load payables error:", err);
      setError("Failed to load payables");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg("");
    try {
      await createPayable({ ...form, totalAmount: Number(form.totalAmount) });
      setForm(emptyForm);
      setSuccessMsg("Payable created successfully!");
      load();
    } catch (err) {
      console.error("Create payable error:", err);
      setError(err.response?.data?.message || "Failed to create payable");
    }
  };

  const handleRecordPayment = async () => {
    if (!payModal) return;
    try {
      await recordPayment(payModal._id, { amount: Number(payAmount) });
      setPayModal(null);
      setPayAmount("");
      setSuccessMsg("Payment recorded!");
      load();
    } catch (err) {
      console.error("Record payment error:", err);
      setError(err.response?.data?.message || "Failed to record payment");
    }
  };

  return (
    <main>
      <section className="team-section">
        <div className="section-header">
          <div>
            <h2>Accounts Payable</h2>
            <p className="section-subtitle">Track supplier invoices, payments, and aging analysis</p>
          </div>
        </div>

        {error && <div className="p-4 text-red-400 text-sm bg-red-400/10 rounded-lg mb-4">{error}</div>}
        {successMsg && <div className="p-4 text-neuPrimary text-sm bg-neuPrimary/10 rounded-lg mb-4">{successMsg}</div>}

        {aging && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {Object.entries(aging.buckets || {}).map(([group, data]) => (
              <NeuCard key={group} className="p-4">
                <p className="text-xs text-neuTextMuted">{group}</p>
                <p className="text-lg font-bold text-neuTextDark mt-1">
                  {data.totalOutstanding?.toLocaleString()}
                </p>
                <p className="text-xs text-neuTextMuted">{data.count} invoice(s)</p>
              </NeuCard>
            ))}
          </div>
        )}

        <NeuCard>
          <h3 className="text-lg font-semibold text-neuPrimary mb-4">New Payable</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <NeuInput name="supplierName" value={form.supplierName} onChange={handleChange} placeholder="Supplier name" />
            <NeuInput name="invoiceNumber" value={form.invoiceNumber} onChange={handleChange} placeholder="Invoice number" />
            <NeuInput name="purchaseOrderNumber" value={form.purchaseOrderNumber} onChange={handleChange} placeholder="PO number (optional)" />
            <NeuInput name="totalAmount" type="number" value={form.totalAmount} onChange={handleChange} placeholder="Total amount" />
            <NeuInput name="issueDate" type="date" value={form.issueDate} onChange={handleChange} placeholder="Issue date" />
            <NeuInput name="dueDate" type="date" value={form.dueDate} onChange={handleChange} placeholder="Due date" />
            <div className="sm:col-span-3">
              <NeuButton type="submit">Create Payable</NeuButton>
            </div>
          </form>
          <p className="text-xs text-neuTextMuted mt-2">
            Supplier and PO are entered manually until Module 2 (Procurement) is merged.
          </p>
        </NeuCard>

        <NeuCard>
          <h3 className="text-lg font-semibold text-neuPrimary mb-4">Payables</h3>
          {loading ? (
            <p className="text-neuTextMuted text-sm">Loading...</p>
          ) : payables.length === 0 ? (
            <p className="text-neuTextMuted text-sm">No payables yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-neuTextMuted border-b border-neuBorder">
                    <th className="py-2 pr-4">Supplier</th>
                    <th className="py-2 pr-4">Invoice</th>
                    <th className="py-2 pr-4">Due</th>
                    <th className="py-2 pr-4">Outstanding</th>
                    <th className="py-2 pr-4">Aging</th>
                    <th className="py-2 pr-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {payables.map((p) => (
                    <tr key={p._id} className="border-b border-neuBorder/50">
                      <td className="py-2 pr-4 text-neuTextDark font-medium">{p.supplierName}</td>
                      <td className="py-2 pr-4 text-neuTextMuted">{p.invoiceNumber}</td>
                      <td className="py-2 pr-4 text-neuTextMuted">
                        {new Date(p.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-2 pr-4 font-semibold text-neuPrimary">
                        {p.outstandingAmount?.toLocaleString()} {p.currency}
                      </td>
                      <td className="py-2 pr-4">
                        <NeuBadge variant={agingVariant(p.agingGroup)}>{p.agingGroup}</NeuBadge>
                      </td>
                      <td className="py-2 pr-4 text-right">
                        {p.outstandingAmount > 0 && (
                          <button
                            onClick={() => { setPayModal(p); setPayAmount(""); }}
                            className="text-neuPrimary text-xs font-semibold hover:underline"
                          >
                            Record Payment
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </NeuCard>
      </section>

      {payModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <NeuCard className="max-w-sm w-full">
            <h3 className="text-lg font-semibold text-neuPrimary mb-2">
              Record Payment — {payModal.supplierName}
            </h3>
            <p className="text-sm text-neuTextMuted mb-4">
              Outstanding: {payModal.outstandingAmount?.toLocaleString()} {payModal.currency}
            </p>
            <NeuInput
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              placeholder="Payment amount"
            />
            <div className="flex gap-3 mt-4">
              <NeuButton onClick={handleRecordPayment}>Confirm Payment</NeuButton>
              <NeuButton onClick={() => setPayModal(null)} className="!bg-transparent">Cancel</NeuButton>
            </div>
          </NeuCard>
        </div>
      )}
    </main>
  );
};

export default PayablesPage;