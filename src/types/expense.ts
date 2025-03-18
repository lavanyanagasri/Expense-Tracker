
export type ExpenseCategory = 
  | 'Food'
  | 'Transportation'
  | 'Housing'
  | 'Utilities'
  | 'Entertainment'
  | 'Shopping'
  | 'Health'
  | 'Education'
  | 'Personal'
  | 'Other';

export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  notes?: string;
};

export type ExpenseSummary = {
  totalExpenses: number;
  categoryTotals: Record<ExpenseCategory, number>;
  dailyExpenses: Record<string, number>;
  monthlyExpenses: Record<string, number>;
};
