// src/pages/ExpenseCreatePage.jsx
import { useState } from "react";
import { createExpense } from "../services/financeApi";

const ExpenseCreatePage = () => {
  const [formData, setFormData] = useState({
  title: "",
  amount: "",
  category: "",
  description: "",
  expenseDate: new Date().toISOString().split("T")[0],
});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg("");
    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
      };
      await createExpense(payload);
      setSuccessMsg("Expense created successfully!");
      // reset form
      setFormData({ title: "", amount: "", category: "", description: "" });
    } catch (err) {
  console.error("CREATE EXPENSE ERROR: ", err);
  if (err.response) {
    console.log("Backend status:", err.response.status);
    console.log("Backend validation message:", err.response.data);
  }
  setError("Failed to create expense.");
}
 finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "0 1rem" }}>
      <h2>Create New Expense</h2>

      {error && <div style={{ color: "red", margin: "1rem 0" }}>{error}</div>}
      {successMsg && <div style={{ color: "green", margin: "1rem 0" }}>{successMsg}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ margin: "1rem 0" }}>
          <label>Title</label>
          <br />
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "0.6rem", marginTop: "0.4rem" }}
            placeholder="Expense title"
          />
        </div>

        <div style={{ margin: "1rem 0" }}>
          <label>Amount (BDT)</label>
          <br />
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "0.6rem", marginTop: "0.4rem" }}
            placeholder="Amount"
          />
        </div>

        <div style={{ margin: "1rem 0" }}>
          <label>Category</label>
          <br />
          <input
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "0.6rem", marginTop: "0.4rem" }}
            placeholder="e.g. Utilities, Raw Material"
          />
        </div>

        <div style={{ margin: "1rem 0" }}>
          <label>Description</label>
          <br />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.6rem", marginTop: "0.4rem", minHeight: "80px" }}
            placeholder="Optional notes"
          />
        </div>
        <div style={{ margin: "1rem 0" }}>
  <label>Expense Date</label>
  <br />
  <input
    type="date"
    name="expenseDate"
    value={formData.expenseDate}
    onChange={handleChange}
    required
    style={{ width: "100%", padding: "0.6rem", marginTop: "0.4rem" }}
  />
</div>


        <button
          type="submit"
          disabled={loading}
          style={{ padding: "0.7rem 1.4rem", cursor: "pointer" }}
        >
          {loading ? "Submitting..." : "Create Expense"}
        </button>
      </form>
    </div>
  );
};

export default ExpenseCreatePage;
