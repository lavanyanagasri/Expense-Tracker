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
import { PlusIcon, LineChart, Wallet } from 'lucide-react';
import AuthDialog from '@/components/auth/AuthDialog';
import { 
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";

const Index = () => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  
  useEffect(() => {
    const fetchExpenses = async () => {
      if (authLoading) return; // Wait for auth to be determined
      
      setIsLoading(true);
      try {
        const storedExpenses = await loadExpensesFromStorage();
        
        if (isAuthenticated && user) {
          const userExpenses = storedExpenses.filter(
            (expense: Expense) => expense.userId === user.id
          );
          setExpenses(userExpenses);
        } else {
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
  
  const handleAddExpense = async (expense: Expense) => {
    const expenseWithUser = isAuthenticated && user 
      ? { ...expense, userId: user.id } 
      : expense;
      
    const updatedExpenses = [expenseWithUser, ...expenses];
    setExpenses(updatedExpenses);
    await saveExpensesToStorage(updatedExpenses);
  };
  
  const handleDeleteExpense = async (id: string) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    setExpenses(updatedExpenses);
    await saveExpensesToStorage(updatedExpenses);
    saveActivityToCookie();
  };

  const handleGetStartedClick = () => {
    if (isAuthenticated) {
      const expenseFormElement = document.querySelector('.expense-form-container');
      if (expenseFormElement) {
        expenseFormElement.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setAuthDialogOpen(true);
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="min-h-screen bg-background bg-gradient-to-br from-background to-secondary/20">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {isAuthenticated ? (
          <div className="space-y-8 mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in">
              <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:translate-y-[-5px] duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-muted-foreground text-sm font-medium">Total Expenses</h3>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-3xl font-bold mt-3">${totalExpenses.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {expenses.length} {expenses.length === 1 ? 'transaction' : 'transactions'} total
                </p>
              </div>
              
              <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:translate-y-[-5px] duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-muted-foreground text-sm font-medium">Time Period</h3>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <LineChart className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-3xl font-bold mt-3">
                  {new Date().toLocaleDateString('en-US', { month: 'long' })}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date().getFullYear()}
                </p>
              </div>
              
              <div className="md:hidden">
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button className="w-full h-[102px] text-xl flex flex-col gap-3 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 rounded-2xl shadow-sm hover:shadow-md transition-all hover:translate-y-[-5px] duration-300">
                      <PlusIcon className="h-6 w-6" />
                      <span>Add Expense</span>
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="p-6 pt-0 max-h-[90vh] overflow-y-auto">
                    <div className="mt-2 mb-8">
                      <ExpenseForm onAddExpense={handleAddExpense} className="shadow-none border-none p-0" />
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>
              
              <div className="hidden md:block bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:translate-y-[-5px] duration-300 expense-form-container">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-muted-foreground text-sm font-medium">Quick Add</h3>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <PlusIcon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => {
                    const expenseFormElement = document.querySelector('.expense-form-container');
                    if (expenseFormElement) {
                      expenseFormElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  New Expense
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="lg:col-span-1 hidden md:block expense-form-container">
                <ExpenseForm onAddExpense={handleAddExpense} />
              </div>
              
              <div className="lg:col-span-2 space-y-6">
                {isLoading ? (
                  <div className="h-[300px] flex items-center justify-center bg-card border border-border/50 rounded-2xl p-6 shadow-sm animate-pulse">
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
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="mb-8 bg-primary/10 p-6 rounded-full animate-float">
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
            <h1 className="text-4xl font-bold tracking-tight mb-3 animate-fade-in">Track Your Expenses</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Sign in to track, manage, and visualize your expenses all in one place.
              Keep control of your finances with our simple tracking tool.
            </p>
            <Button 
              size="lg" 
              className="gap-2 animate-fade-in hover:scale-105 transition-transform"
              style={{ animationDelay: "0.2s" }}
              onClick={handleGetStartedClick}
            >
              <PlusIcon size={16} />
              Get Started
            </Button>
            
            <div className="relative w-full max-w-2xl mt-20 h-20">
              <div className="absolute w-20 h-20 bg-primary/5 rounded-full -top-12 left-10 animate-float" style={{ animationDelay: "0.5s" }}></div>
              <div className="absolute w-16 h-16 bg-primary/10 rounded-full top-0 right-20 animate-float" style={{ animationDelay: "1.2s" }}></div>
              <div className="absolute w-12 h-12 bg-primary/15 rounded-full -bottom-4 left-1/4 animate-float" style={{ animationDelay: "0.7s" }}></div>
            </div>
          </div>
        )}
      </main>
      
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </div>
  );
};

export default Index;
