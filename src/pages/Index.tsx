
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
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  
  // Load expenses from storage on component mount or when user changes
  useEffect(() => {
    const fetchExpenses = async () => {
      if (authLoading) return; // Wait for auth to be determined
      
      setIsLoading(true);
      try {
        const storedExpenses = await loadExpensesFromStorage();
        
        // Filter expenses for the current user if authenticated
        if (isAuthenticated && user) {
          const userExpenses = storedExpenses.filter(
            (expense: Expense) => expense.userId === user.id
          );
          setExpenses(userExpenses);
        } else {
          // For demo purposes, show all expenses if not logged in
          setExpenses(storedExpenses);
        }
        
        saveActivityToCookie();
      } catch (error) {
        console.error("Failed to load expenses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExpenses();
  }, [isAuthenticated, user, authLoading]);
  
  // Add a new expense
  const handleAddExpense = async (expense: Expense) => {
    // Add user ID to expense if authenticated
    const expenseWithUser = isAuthenticated && user 
      ? { ...expense, userId: user.id } 
      : expense;
      
    const updatedExpenses = [expenseWithUser, ...expenses];
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
        {isAuthenticated ? (
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
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="mb-8 bg-primary/10 p-6 rounded-full">
              <svg 
                width="48" 
                height="48" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary"
              >
                <path 
                  d="M12 6V18M18 12H6" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-3">Track Your Expenses</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mb-8">
              Sign in to track, manage, and visualize your expenses all in one place.
              Keep control of your finances with our simple tracking tool.
            </p>
            <Button 
              size="lg" 
              className="gap-2"
              onClick={() => setAuthDialogOpen(true)}
            >
              <PlusIcon size={16} />
              Get Started
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
