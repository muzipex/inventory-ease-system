
import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, DollarSign, Receipt, Calendar } from 'lucide-react';
import { Expense } from '@/hooks/useExpenses';

interface ExpenseQuickStatsProps {
  expenses: Expense[];
  onCardClick?: (type: string) => void;
}

const ExpenseQuickStats = ({ expenses, onCardClick }: ExpenseQuickStatsProps) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  
  const thisMonthExpenses = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.expense_date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    })
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  const recurringExpenses = expenses.filter(expense => expense.is_recurring);
  const monthlyRecurringCost = recurringExpenses
    .filter(expense => expense.recurring_frequency === 'monthly')
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const lastMonthExpenses = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.expense_date);
      return expenseDate.getMonth() === lastMonth && expenseDate.getFullYear() === lastMonthYear;
    })
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  const monthlyGrowth = lastMonthExpenses > 0 
    ? (((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100).toFixed(1)
    : '0.0';

  const stats = [
    {
      title: 'Total Expenses',
      value: `UGX ${totalExpenses.toLocaleString()}`,
      change: 'all time',
      icon: DollarSign,
      color: 'text-red-600',
      bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
      type: 'total'
    },
    {
      title: 'This Month',
      value: `UGX ${thisMonthExpenses.toLocaleString()}`,
      change: `${monthlyGrowth.startsWith('-') ? monthlyGrowth : `+${monthlyGrowth}`}% vs last month`,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      type: 'monthly'
    },
    {
      title: 'Recurring Monthly',
      value: `UGX ${monthlyRecurringCost.toLocaleString()}`,
      change: `${recurringExpenses.length} recurring expenses`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
      type: 'recurring'
    },
    {
      title: 'Total Records',
      value: expenses.length.toString(),
      change: 'expense entries',
      icon: Receipt,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      type: 'records'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className={`p-6 hover:shadow-lg transition-all duration-200 border-0 shadow-md ${
            onCardClick ? 'cursor-pointer hover:scale-105' : ''
          }`}
          onClick={() => onCardClick?.(stat.type)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className={`text-sm ${
                stat.change.includes('+') ? 'text-red-600' : 
                stat.change.includes('-') ? 'text-green-600' : 
                'text-gray-500'
              }`}>
                {stat.change}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bgColor} shadow-sm`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ExpenseQuickStats;
