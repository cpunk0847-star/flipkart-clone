import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface BudgetRange {
  min: number | null;
  max: number | null;
}

interface BudgetContextType {
  budget: BudgetRange;
  setBudget: (budget: BudgetRange) => void;
  clearBudget: () => void;
  isActive: boolean;
  isWithinBudget: (price: number) => boolean;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const budgetPresets = [
  { label: "Under ₹2,500", min: 0, max: 2499 },
  { label: "₹2,500 - ₹10,000", min: 2500, max: 9999 },
  { label: "₹10,000 - ₹30,000", min: 10000, max: 29999 },
  { label: "₹30,000 - ₹75,000", min: 30000, max: 74999 },
  { label: "Above ₹75,000", min: 75000, max: null },
];

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
  const [budget, setBudgetState] = useState<BudgetRange>(() => {
    const saved = localStorage.getItem("budget_filter");
    return saved ? JSON.parse(saved) : { min: null, max: null };
  });

  useEffect(() => {
    if (budget.min !== null || budget.max !== null) {
      localStorage.setItem("budget_filter", JSON.stringify(budget));
      // Track budget applied
      console.log("[Analytics] budget_applied", budget);
    } else {
      localStorage.removeItem("budget_filter");
    }
  }, [budget]);

  const setBudget = (newBudget: BudgetRange) => {
    setBudgetState(newBudget);
  };

  const clearBudget = () => {
    setBudgetState({ min: null, max: null });
    console.log("[Analytics] budget_cleared");
  };

  const isActive = budget.min !== null || budget.max !== null;

  const isWithinBudget = (price: number) => {
    if (!isActive) return true;
    const meetsMin = budget.min === null || price >= budget.min;
    const meetsMax = budget.max === null || price <= budget.max;
    return meetsMin && meetsMax;
  };

  return (
    <BudgetContext.Provider value={{ budget, setBudget, clearBudget, isActive, isWithinBudget }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error("useBudget must be used within a BudgetProvider");
  }
  return context;
};
