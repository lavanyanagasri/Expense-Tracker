
import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Expense, ExpenseCategory } from '@/types/expense';
import { formatCurrency } from '@/utils/storage';
import { cn } from '@/lib/utils';

interface ExpenseChartProps {
  expenses: Expense[];
  className?: string;
}

// Category colors matching those used in ExpenseList
const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: '#FB923C',
  Transportation: '#60A5FA',
  Housing: '#C084FC',
  Utilities: '#FACC15',
  Entertainment: '#F472B6',
  Shopping: '#34D399',
  Health: '#F87171',
  Education: '#818CF8',
  Personal: '#22D3EE',
  Other: '#9CA3AF',
};

const ExpenseChart: React.FC<ExpenseChartProps> = ({ expenses, className }) => {
  // Prepare data for pie chart (categories)
  const categoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(expense => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += expense.amount;
    });
    
    return Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category,
      value: amount,
    })).sort((a, b) => b.value - a.value);
  }, [expenses]);
  
  // Prepare data for bar chart (last 7 days)
  const dailyData = useMemo(() => {
    const dailyTotals: Record<string, number> = {};
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 6); // Last 7 days including today
    
    // Initialize all days
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      dailyTotals[dateString] = 0;
    }
    
    // Sum expenses for each day
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      if (expenseDate >= startDate && expenseDate <= today) {
        const dateString = expense.date;
        dailyTotals[dateString] = (dailyTotals[dateString] || 0) + expense.amount;
      }
    });
    
    // Convert to array for chart
    return Object.entries(dailyTotals)
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        amount,
        fullDate: date,
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  }, [expenses]);
  
  // Calculate total expenses
  const totalExpenses = useMemo(() => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }, [expenses]);
  
  // Calculate average daily expense
  const averageDailyExpense = useMemo(() => {
    if (dailyData.length === 0) return 0;
    const totalDailyExpense = dailyData.reduce((total, day) => total + day.amount, 0);
    return totalDailyExpense / dailyData.length;
  }, [dailyData]);
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 text-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p>{formatCurrency(payload[0].value)}</p>
          <p className="text-xs text-muted-foreground">
            {((payload[0].value / totalExpenses) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };
  
  const BarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 text-sm">
          <p className="font-medium">{label}</p>
          <p>{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn(
      "w-full bg-card border border-border/50 rounded-2xl p-6 shadow-sm",
      "transition-all duration-300 ease-in-out animate-scale-in",
      className
    )}>
      <h2 className="text-xl font-medium mb-4">Expense Analysis</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-secondary/50 rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Expenses</p>
          <p className="text-2xl font-semibold">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Daily Average (Last 7 Days)</p>
          <p className="text-2xl font-semibold">{formatCurrency(averageDailyExpense)}</p>
        </div>
      </div>
      
      {expenses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Add expenses to see your spending analysis</p>
        </div>
      ) : (
        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="categories">By Category</TabsTrigger>
            <TabsTrigger value="timeline">Last 7 Days</TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                  animationDuration={750}
                  animationBegin={0}
                  animationEasing="ease-out"
                >
                  {categoryData.map((entry) => (
                    <Cell 
                      key={`cell-${entry.name}`} 
                      fill={CATEGORY_COLORS[entry.name as ExpenseCategory] || '#9CA3AF'} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="timeline" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `$${value}`} 
                />
                <Tooltip content={<BarTooltip />} />
                <Bar 
                  dataKey="amount" 
                  radius={[4, 4, 0, 0]} 
                  fill="rgba(24, 119, 242, 0.7)"
                  animationDuration={750}
                  animationBegin={0}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ExpenseChart;
