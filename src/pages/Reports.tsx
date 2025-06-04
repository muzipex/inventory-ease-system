
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { BarChart3, TrendingUp, Download, Calendar, DollarSign, Package, Users, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { useExpenses } from '@/hooks/useExpenses';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DateRangePicker from '@/components/DateRangePicker';

const Reports = () => {
  const { products, loading: productsLoading } = useProducts();
  const { sales, loading: salesLoading } = useSales();
  const { expenses, categories, loading: expensesLoading } = useExpenses();
  const { toast } = useToast();
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('this_month');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  if (productsLoading || salesLoading || expensesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading reports...</div>
      </div>
    );
  }

  // Calculate metrics
  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const netProfit = totalRevenue - totalExpenses;
  const totalOrders = sales.length;
  const lowStockItems = products.filter(product => product.stock <= product.min_stock);

  // Monthly calculations
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthSales = sales.filter(sale => {
    const saleDate = new Date(sale.sale_date);
    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
  });
  const thisMonthRevenue = thisMonthSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);

  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.expense_date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });
  const thisMonthExpenseTotal = thisMonthExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  // Growth calculations
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const lastMonthSales = sales.filter(sale => {
    const saleDate = new Date(sale.sale_date);
    return saleDate.getMonth() === lastMonth && saleDate.getFullYear() === lastMonthYear;
  });
  const lastMonthRevenue = lastMonthSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  
  const salesGrowth = lastMonthRevenue > 0 
    ? (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
    : '0.0';
  const salesGrowthText = salesGrowth.startsWith('-') ? salesGrowth : `+${salesGrowth}`;

  // Expense analytics - synchronized with expenses section
  const expensesByCategory = categories.map(category => {
    const categoryExpenses = expenses.filter(expense => expense.category_id === category.id);
    const total = categoryExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    return {
      name: category.name,
      total,
      count: categoryExpenses.length,
    };
  }).sort((a, b) => b.total - a.total);

  // Top selling products/customers
  const productSales: Record<string, { sales: number; revenue: number }> = {};
  sales.forEach(sale => {
    if (!productSales[sale.customer_name]) {
      productSales[sale.customer_name] = {
        sales: 0,
        revenue: 0
      };
    }
    productSales[sale.customer_name].sales += sale.items_count;
    productSales[sale.customer_name].revenue += Number(sale.total_amount);
  });

  const topCustomers = Object.entries(productSales)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5)
    .map(([name, data]) => ({
      name,
      sales: data.sales,
      revenue: data.revenue
    }));

  // Monthly trends
  const monthlyTrend = [];
  for (let i = 3; i >= 0; i--) {
    const targetMonth = currentMonth - i < 0 ? 12 + (currentMonth - i) : currentMonth - i;
    const targetYear = currentMonth - i < 0 ? currentYear - 1 : currentYear;
    
    const monthSales = sales.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      return saleDate.getMonth() === targetMonth && saleDate.getFullYear() === targetYear;
    });
    
    const monthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.expense_date);
      return expenseDate.getMonth() === targetMonth && expenseDate.getFullYear() === targetYear;
    });
    
    const monthRevenue = monthSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
    const monthExpenseTotal = monthExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    monthlyTrend.push({
      month: monthNames[targetMonth],
      sales: monthRevenue,
      expenses: monthExpenseTotal,
      profit: monthRevenue - monthExpenseTotal,
    });
  }

  const maxMonthlySales = Math.max(...monthlyTrend.map(m => m.sales), 1);

  const handleExport = (type: string) => {
    let csvContent = "";
    let filename = "";

    switch (type) {
      case 'overview':
        csvContent = "data:text/csv;charset=utf-8," 
          + "Metric,Value\n"
          + `Total Revenue,UGX ${totalRevenue.toLocaleString()}\n`
          + `Total Expenses,UGX ${totalExpenses.toLocaleString()}\n`
          + `Net Profit,UGX ${netProfit.toLocaleString()}\n`
          + `Total Orders,${totalOrders}\n`
          + `Sales Growth,${salesGrowthText}%\n`
          + `Low Stock Items,${lowStockItems.length}`;
        filename = "overview_report.csv";
        break;
      
      case 'expenses':
        csvContent = "data:text/csv;charset=utf-8," 
          + "Category,Total Amount,Number of Expenses\n"
          + expensesByCategory.map(cat => 
              `${cat.name},UGX ${cat.total.toLocaleString()},${cat.count}`
            ).join("\n");
        filename = "expense_report.csv";
        break;
      
      case 'customers':
        csvContent = "data:text/csv;charset=utf-8," 
          + "Customer,Total Purchases,Revenue\n"
          + topCustomers.map(customer => 
              `${customer.name},${customer.sales},UGX ${customer.revenue.toLocaleString()}`
            ).join("\n");
        filename = "customer_report.csv";
        break;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: `${type} report has been downloaded as CSV`,
    });
  };

  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="this_quarter">This Quarter</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          {dateRange === 'custom' && (
            <DateRangePicker onDateRangeChange={handleDateRangeChange} />
          )}
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">UGX {totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-500">all time</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">UGX {totalExpenses.toLocaleString()}</p>
              <p className="text-sm text-gray-500">all time</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50">
              <Receipt className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Profit</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                UGX {netProfit.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">revenue - expenses</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sales Growth</p>
              <p className={`text-2xl font-bold ${salesGrowthText.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {salesGrowthText}%
              </p>
              <p className="text-sm text-gray-500">vs last month</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs value={reportType} onValueChange={setReportType} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Business Overview</h3>
            <Button variant="outline" onClick={() => handleExport('overview')} className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export Overview</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trend */}
            <Card className="p-6">
              <h4 className="text-lg font-semibold mb-4">Monthly Performance</h4>
              <div className="space-y-4">
                {monthlyTrend.map((month, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{month.month}</span>
                      <span className="text-sm">
                        Profit: UGX {month.profit.toLocaleString()}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(month.sales / maxMonthlySales) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">Sales: UGX {month.sales.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ width: `${(month.expenses / maxMonthlySales) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">Expenses: UGX {month.expenses.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* This Month Summary */}
            <Card className="p-6">
              <h4 className="text-lg font-semibold mb-4">This Month Summary</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Revenue</span>
                  <span className="font-bold text-green-600">UGX {thisMonthRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="font-medium">Expenses</span>
                  <span className="font-bold text-red-600">UGX {thisMonthExpenseTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Net Profit</span>
                  <span className={`font-bold ${(thisMonthRevenue - thisMonthExpenseTotal) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    UGX {(thisMonthRevenue - thisMonthExpenseTotal).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Orders</span>
                  <span className="font-bold text-gray-600">{thisMonthSales.length}</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Expense Analysis</h3>
            <Button variant="outline" onClick={() => handleExport('expenses')} className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export Expenses</span>
            </Button>
          </div>

          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Expenses by Category</h4>
            <div className="space-y-4">
              {expensesByCategory.map((category, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-gray-500">{category.count} expenses</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">UGX {category.total.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">
                      {totalExpenses > 0 ? ((category.total / totalExpenses) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Inventory Report</h3>
            <Button variant="outline" onClick={() => handleExport('inventory')} className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export Inventory</span>
            </Button>
          </div>

          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Stock Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">In Stock</p>
                <p className="text-2xl font-bold text-green-700">
                  {products.filter(p => p.stock > p.min_stock).length}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-600 font-medium">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {products.filter(p => p.stock <= p.min_stock && p.stock > 0).length}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600 font-medium">Out of Stock</p>
                <p className="text-2xl font-bold text-red-700">
                  {products.filter(p => p.stock === 0).length}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium">Items Requiring Attention</h5>
              {lowStockItems.length > 0 ? lowStockItems.map((product) => (
                <div key={product.id} className={`flex justify-between items-center p-3 rounded-lg ${
                  product.stock === 0 ? 'bg-red-50' : 'bg-yellow-50'
                }`}>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">
                      {product.stock === 0 ? 'Out of stock' : `${product.stock} units remaining`}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">Reorder</Button>
                </div>
              )) : (
                <p className="text-gray-500">All products are well stocked</p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Customer Analysis</h3>
            <Button variant="outline" onClick={() => handleExport('customers')} className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export Customers</span>
            </Button>
          </div>

          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Top Customers</h4>
            <div className="space-y-4">
              {topCustomers.length > 0 ? topCustomers.map((customer, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-gray-500">{customer.sales} items purchased</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">UGX {customer.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">total spent</p>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500">No customer data available</p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
