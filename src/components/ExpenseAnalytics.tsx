
import React from 'react';
import { Card } from '@/components/ui/card';
import { Expense } from '@/hooks/useExpenses';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface ExpenseAnalyticsProps {
  expenses: Expense[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const ExpenseAnalytics = ({ expenses }: ExpenseAnalyticsProps) => {
  // Category breakdown data
  const categoryData = expenses.reduce((acc, expense) => {
    const categoryName = expense.expense_categories?.name || 'Uncategorized';
    const existing = acc.find(item => item.name === categoryName);
    if (existing) {
      existing.value += Number(expense.amount);
    } else {
      acc.push({ name: categoryName, value: Number(expense.amount) });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Monthly trend data (last 6 months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    const monthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.expense_date);
      return expenseDate >= monthStart && expenseDate <= monthEnd;
    });
    
    const total = monthExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    monthlyData.push({
      month: format(date, 'MMM yyyy'),
      amount: total
    });
  }

  // Payment method breakdown
  const paymentMethodData = expenses.reduce((acc, expense) => {
    const method = expense.payment_method.replace('_', ' ');
    const existing = acc.find(item => item.name === method);
    if (existing) {
      existing.value += Number(expense.amount);
    } else {
      acc.push({ name: method, value: Number(expense.amount) });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Pie Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`UGX ${Number(value).toLocaleString()}`, 'Amount']} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Payment Method Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentMethodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`UGX ${Number(value).toLocaleString()}`, 'Amount']} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Expense Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `UGX ${value.toLocaleString()}`} />
            <Tooltip formatter={(value) => [`UGX ${Number(value).toLocaleString()}`, 'Amount']} />
            <Legend />
            <Bar dataKey="amount" fill="#0088FE" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default ExpenseAnalytics;
