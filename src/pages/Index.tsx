
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import ExpenseChart from '@/components/ExpenseChart';
import { Expense } from '@/types/expense';
import { 
  loadExpensesFromStorage, 
  saveExpensesToStorage, 
  saveActivityToCookie 
} from '@/utils/storage';

const Index = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load expenses from storage on component mount
  useEffect(() => {
    const fetchExpenses = async () => {
      setIsLoading(true);
      try {
        const storedExpenses = await loadExpensesFromStorage();
        setExpenses(storedExpenses);
        saveActivityToCookie();
      } catch (error) {
        console.error("Failed to load expenses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExpenses();
  }, []);
  
  // Add a new expense
  const handleAddExpense = async (expense: Expense) => {
    const updatedExpenses = [expense, ...expenses];
    setExpenses(updatedExpenses);
    await saveExpensesToStorage(updatedExpenses);
  };
  
  // Delete an expense
  const handleDeleteExpense = async (id: string) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    setExpenses(updatedExpenses);
    await saveExpensesToStorage(updatedExpenses);
    saveActivityToCookie();
  };

  return (
    <div className="min-h-screen bg-background bg-gradient-to-br from-background to-secondary/20">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-1">
            <ExpenseForm onAddExpense={handleAddExpense} />
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                <div className="text-muted-foreground">Loading your expenses...</div>
              </div>
            ) : (
              <>
                <ExpenseChart expenses={expenses} />
                <ExpenseList 
                  expenses={expenses} 
                  onDeleteExpense={handleDeleteExpense} 
                />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
