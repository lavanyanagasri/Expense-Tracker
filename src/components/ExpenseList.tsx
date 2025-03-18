
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Expense, ExpenseCategory } from '@/types/expense';
import { formatCurrency, formatDate } from '@/utils/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Filter, MoreVertical, Trash2, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  className?: string;
}

const categoryColors: Record<ExpenseCategory, string> = {
  Food: 'bg-orange-100 text-orange-700',
  Transportation: 'bg-blue-100 text-blue-700',
  Housing: 'bg-purple-100 text-purple-700',
  Utilities: 'bg-yellow-100 text-yellow-700',
  Entertainment: 'bg-pink-100 text-pink-700',
  Shopping: 'bg-emerald-100 text-emerald-700',
  Health: 'bg-red-100 text-red-700',
  Education: 'bg-indigo-100 text-indigo-700',
  Personal: 'bg-cyan-100 text-cyan-700',
  Other: 'bg-gray-100 text-gray-700',
};

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDeleteExpense, className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleDelete = (id: string) => {
    onDeleteExpense(id);
    toast.success('Expense deleted successfully');
  };

  const filteredExpenses = expenses
    .filter(expense => {
      const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            expense.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter ? expense.category === categoryFilter : true;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value === 'All' ? '' : value as ExpenseCategory);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  const categories: ExpenseCategory[] = [
    'Food', 'Transportation', 'Housing', 'Utilities',
    'Entertainment', 'Shopping', 'Health', 'Education', 'Personal', 'Other'
  ];

  return (
    <div className={cn(
      "w-full bg-card border border-border/50 rounded-2xl p-6 shadow-sm",
      "transition-all duration-300 ease-in-out animate-scale-in",
      className
    )}>
      <h2 className="text-xl font-medium mb-4">Expense History</h2>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/50 border-input/50 h-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={categoryFilter || 'All'} onValueChange={handleCategoryFilterChange}>
            <SelectTrigger className="w-[140px] h-10 bg-background/50 border-input/50">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline" 
            size="icon"
            onClick={toggleSortOrder}
            className="h-10 w-10 bg-background/50 border-input/50"
            title={`Sort by date (${sortOrder === 'desc' ? 'newest first' : 'oldest first'})`}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {expenses.length === 0 ? (
            <p>No expenses yet. Add your first expense above.</p>
          ) : (
            <p>No expenses match your filters.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
          {filteredExpenses.map((expense) => (
            <div 
              key={expense.id} 
              className="bg-background/50 border border-border/50 rounded-xl p-4 flex justify-between items-center group hover:shadow-sm transition-all animate-fade-in"
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "mt-1 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                  categoryColors[expense.category]
                )}>
                  <span className="text-xs font-medium">{expense.category.charAt(0)}</span>
                </div>
                
                <div className="flex flex-col">
                  <h3 className="font-medium">{expense.title}</h3>
                  <span className="text-sm text-muted-foreground">{formatDate(expense.date)}</span>
                  {expense.notes && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{expense.notes}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-medium">{formatCurrency(expense.amount)}</span>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="cursor-pointer">
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-destructive focus:text-destructive" 
                      onClick={() => handleDelete(expense.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
