
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
  
  // Load expenses from localStorage on component mount
  useEffect(() => {
    const storedExpenses = loadExpensesFromStorage();
    setExpenses(storedExpenses);
    saveActivityToCookie();
  }, []);
  
  // Add a new expense
  const handleAddExpense = (expense: Expense) => {
    const updatedExpenses = [expense, ...expenses];
    setExpenses(updatedExpenses);
    saveExpensesToStorage(updatedExpenses);
  };
  
  // Delete an expense
  const handleDeleteExpense = (id: string) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    setExpenses(updatedExpenses);
    saveExpensesToStorage(updatedExpenses);
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
            <ExpenseChart expenses={expenses} />
            <ExpenseList 
              expenses={expenses} 
              onDeleteExpense={handleDeleteExpense} 
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
