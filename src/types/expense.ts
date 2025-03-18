
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
  synced?: boolean; // Flag for future cloud sync functionality
  createdAt?: string; // Timestamp when the expense was created
  userId?: string; // ID of the user who created the expense
};

export type ExpenseSummary = {
  totalExpenses: number;
  categoryTotals: Record<ExpenseCategory, number>;
  dailyExpenses: Record<string, number>;
  monthlyExpenses: Record<string, number>;
};
