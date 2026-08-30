import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import BudgetPage from "./BudgetPage";
import { getBudget, createOrUpdateBudget } from "../services/financeApi";

vi.mock("../services/financeApi");

describe("BudgetPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test("shows success message after successful budget save", async () => {
  const user = userEvent.setup();
  getBudget.mockResolvedValue({ data: { data: null } });
  createOrUpdateBudget.mockResolvedValue({ data: {} });

  render(<BudgetPage />);
  await waitFor(() => {
    expect(screen.queryByText(/Loading budget data/i)).not.toBeInTheDocument();
  });

  const nameInput = screen.getByPlaceholderText(/Budget name/i);
  const amountInput = screen.getByPlaceholderText(/Enter monthly budget amount/i);
  const submitBtn = screen.getByRole("button", { name: /Save \/ Update Budget/i });

  await user.type(nameInput, "Test Budget");
  await user.type(amountInput, "20000");
  await user.click(submitBtn);

  await waitFor(() => {
    expect(screen.getByText(/Budget saved successfully/i)).toBeInTheDocument();
  });
});


  test("shows loading state on mount", async () => {
  getBudget.mockResolvedValue({ data: { data: null } });
  render(<BudgetPage />);
  await waitFor(() => {
    expect(screen.getByText(/Loading budget data/i)).toBeInTheDocument();
  });
});


  test("loads existing budget data and populates inputs", async () => {
    getBudget.mockResolvedValue({
      data: {
        data: {
          budgetName: "Household Budget",
          totalMonthlyBudget: 25000
        }
      }
    });
    render(<BudgetPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Household Budget")).toBeInTheDocument();
      expect(screen.getByDisplayValue("25000")).toBeInTheDocument();
    });
  });

  test("can fill form and submit budget", async () => {
    const user = userEvent.setup();
    getBudget.mockResolvedValue({ data: { data: null } });
    createOrUpdateBudget.mockResolvedValue({ data: {} });

    render(<BudgetPage />);
    await waitFor(() => {
      expect(screen.queryByText(/Loading budget data/i)).not.toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/Budget name/i);
    const amountInput = screen.getByPlaceholderText(/Enter monthly budget amount/i);
    const submitBtn = screen.getByRole("button", { name: /Save \/ Update Budget/i });

    await user.clear(nameInput);
    await user.type(nameInput, "Office Budget");
    await user.type(amountInput, "30000");

    await user.click(submitBtn);

    expect(createOrUpdateBudget).toHaveBeenCalledWith({
      budgetName: "Office Budget",
      totalMonthlyBudget: 30000,
      currency: "BDT"
    });
  });

  test("shows error message when save fails", async () => {
    const user = userEvent.setup();
    getBudget.mockResolvedValue({ data: { data: null } });
    createOrUpdateBudget.mockRejectedValue(new Error("API Error"));

    render(<BudgetPage />);
    await waitFor(() => {
      expect(screen.queryByText(/Loading budget data/i)).not.toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/Budget name/i);
    const amountInput = screen.getByPlaceholderText(/Enter monthly budget amount/i);
    const submitBtn = screen.getByRole("button", { name: /Save \/ Update Budget/i });

    await user.type(nameInput, "Test");
    await user.type(amountInput, "10000");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Could not save budget/i)).toBeInTheDocument();
    });
  });
});
