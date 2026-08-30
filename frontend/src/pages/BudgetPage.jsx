import { useState, useEffect } from "react";
import { getBudget, createOrUpdateBudget } from "../services/financeApi";

const BudgetPage = () => {
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetName, setBudgetName] = useState("Monthly Budget");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const loadBudget = async () => {
      setPageLoading(true);
      try {
        const res = await getBudget();
        const backendData = res.data.data;
        if (backendData?.name) {
          setBudgetName(backendData.name);
        }
        if (backendData?.monthlyAmount !== undefined) {
          setBudgetAmount(String(backendData.monthlyAmount));
        }
      } catch (err) {
        setError("Failed to load budget data");
        console.error("Load budget error:", err);
      } finally {
        setPageLoading(false);
      }
    };
    loadBudget();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("form submit triggered, payload preparing");

    const payload = {
      name: budgetName,
      currency: 'BDT',
      category: "Other",
      dueDay: 1,
      startDate: new Date().toISOString(),
      monthlyAmount: Number(budgetAmount),
    };

    console.log("👉 payload to send:", payload);
    setLoading(true);
    setError(null);
    setSuccessMsg("");
    try {
      console.log("calling createOrUpdateBudget api");
      await createOrUpdateBudget(payload);
      console.log("api call success");
      setSuccessMsg("Budget saved successfully!");
      const res = await getBudget();
      const backendData = res.data.data;
      setBudgetName(backendData.name);
      setBudgetAmount(String(backendData.monthlyAmount));
    } catch (err) {
      console.log("❌ API FULL ERROR:", err);
      if (err.response) {
        console.log("✅ BACKEND STATUS:", err.response.status);
        console.log("✅ BACKEND ERROR BODY:", err.response.data);
      }
      setError("Could not save budget. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div>Loading budget data...</div>;
  }

  return (
    <div style={{maxWidth:"600px", margin:"2rem auto", padding:"0 1rem"}}>
      <h2>Monthly Budget Management</h2>
      {error && <div style={{color:"red"}}>{error}</div>}
      {successMsg && <div style={{color:"green"}}>{successMsg}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Budget Name</label>
          <br/>
          <input
            type="text"
            value={budgetName}
            onChange={(e) => setBudgetName(e.target.value)}
            required
            style={{width:"100%", padding:"0.6rem", marginTop:"0.4rem"}}
            placeholder="Budget name"
          />
        </div>
        <div style={{marginTop:"12px"}}>
          <label>Monthly Budget (BDT)</label>
          <br/>
          <input
            type="number"
            value={budgetAmount}
            onChange={(e) => setBudgetAmount(e.target.value)}
            required
            style={{width:"100%", padding:"0.6rem", marginTop:"0.4rem"}}
            placeholder="Enter monthly budget amount"
          />
        </div>
        <div style={{marginTop:"16px"}}>
          <button type="submit" disabled={loading} style={{padding:"0.7rem 1.4rem"}}>
            {loading ? "Saving..." : "Save / Update Budget"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BudgetPage;
