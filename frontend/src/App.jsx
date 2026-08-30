import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import NeuCard from "./components/ui/NeuCard";
import ExpenseCreatePage from "./pages/ExpenseCreatePage";
import BudgetPage from "./pages/BudgetPage";
import FinanceDashboard from "./pages/FinanceDashboard";


function App() {
  return (
    <Router>
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <NeuCard className="mb-6">
          {/* smaller font only, NO nowrap, box keeps original size */}
          <h1 className="text-lg md:text-xl font-bold text-neuPrimary">
            Inventory & Finance Management System
          </h1>
        </NeuCard>
        <Routes>
          <Route path="/" element={<FinanceDashboard />}/>
          <Route path="/finance/budget" element={<BudgetPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/finance/expenses/create" element={<ExpenseCreatePage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
