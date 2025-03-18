
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Expense, ExpenseCategory } from '@/types/expense';
import { saveActivityToCookie } from '@/utils/storage';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpenseFormProps {
  onAddExpense: (expense: Expense) => void;
  className?: string;
}

const CATEGORIES: ExpenseCategory[] = [
  'Food', 'Transportation', 'Housing', 'Utilities',
  'Entertainment', 'Shopping', 'Health', 'Education', 'Personal', 'Other'
];

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddExpense, className }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Other');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setCategory('Other');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setIsExpanded(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !amount || !category || !date) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      title,
      amount: amountNum,
      category,
      date,
      notes: notes || undefined,
      synced: false,
      createdAt: new Date().toISOString(),
    };

    onAddExpense(newExpense);
    saveActivityToCookie();
    toast.success('Expense added successfully');
    resetForm();
  };

  return (
    <div className={cn(
      "w-full bg-card border border-border/50 rounded-2xl p-6 shadow-sm",
      "transition-all duration-300 ease-in-out animate-scale-in",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium">Add New Expense</h2>
        {isExpanded && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={resetForm}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="What did you spend on?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-12 bg-background/50 border-input/50 focus:border-primary"
            onFocus={() => setIsExpanded(true)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-12 pl-8 bg-background/50 border-input/50 focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 bg-background/50 border-input/50 focus:border-primary"
            />
          </div>
        </div>

        {isExpanded && (
          <>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as ExpenseCategory)}>
                <SelectTrigger className="h-12 bg-background/50 border-input/50 focus:border-primary">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional details?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px] bg-background/50 border-input/50 focus:border-primary"
              />
            </div>
          </>
        )}

        <Button 
          type="submit" 
          className="w-full h-12 mt-6 bg-primary hover:bg-primary/90 transition-all"
        >
          Save Expense
        </Button>
      </form>
    </div>
  );
};

export default ExpenseForm;
