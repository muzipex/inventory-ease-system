
import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart3, TrendingUp, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { useToast } from '@/hooks/use-toast';

const Reports = () => {
  const { products, loading: productsLoading } = useProducts();
  const { sales, loading: salesLoading } = useSales();
  const { toast } = useToast();

  if (productsLoading || salesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading reports...</div>
      </div>
    );
  }

  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const totalOrders = sales.length;
  const lowStockItems = products.filter(product => product.stock <= product.min_stock);

  // Calculate this month's sales
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthSales = sales.filter(sale => {
    const saleDate = new Date(sale.sale_date);
    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
  });
  const thisMonthRevenue = thisMonthSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);

  // Calculate last month's sales for growth comparison
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

  // Calculate inventory health (percentage of products in stock)
  const inStockProducts = products.filter(product => product.stock > 0).length;
  const inventoryHealth = products.length > 0 ? Math.round((inStockProducts / products.length) * 100) : 0;

  // Get top selling products based on sales data
  const productSales = {};
  sales.forEach(sale => {
    // For this demo, we'll estimate product sales based on order frequency
    // In a real app, you'd query sale_items table
    if (!productSales[sale.customer_name]) {
      productSales[sale.customer_name] = {
        sales: 0,
        revenue: 0
      };
    }
    productSales[sale.customer_name].sales += sale.items_count;
    productSales[sale.customer_name].revenue += Number(sale.total_amount);
  });

  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 3)
    .map(([name, data]) => ({
      name: name,
      sales: data.sales,
      revenue: data.revenue
    }));

  // Calculate monthly trend (last 4 months)
  const monthlyTrend = [];
  for (let i = 3; i >= 0; i--) {
    const targetMonth = currentMonth - i < 0 ? 12 + (currentMonth - i) : currentMonth - i;
    const targetYear = currentMonth - i < 0 ? currentYear - 1 : currentYear;
    
    const monthSales = sales.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      return saleDate.getMonth() === targetMonth && saleDate.getFullYear() === targetYear;
    });
    
    const monthRevenue = monthSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    monthlyTrend.push({
      month: monthNames[targetMonth],
      sales: monthRevenue
    });
  }

  const maxMonthlySales = Math.max(...monthlyTrend.map(m => m.sales), 1);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Report Type,Value\n"
      + `Total Revenue,UGX ${totalRevenue.toLocaleString()}\n`
      + `Total Orders,${totalOrders}\n`
      + `Sales Growth,${salesGrowthText}%\n`
      + `Inventory Health,${inventoryHealth}%\n`
      + `Low Stock Items,${lowStockItems.length}`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reports_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: "Reports data has been downloaded as CSV",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Date Range</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inventory Health</p>
              <p className="text-2xl font-bold text-blue-600">{inventoryHealth}%</p>
              <p className="text-sm text-gray-500">stock availability</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">UGX {totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-500">all time</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              <BarChart3 className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Customer Orders</h3>
          <div className="space-y-4">
            {topProducts.length > 0 ? topProducts.map((product, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.sales} items ordered</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">UGX {product.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">revenue</p>
                </div>
              </div>
            )) : (
              <p className="text-gray-500">No sales data available</p>
            )}
          </div>
        </Card>

        {/* Monthly Sales Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Sales Trend</h3>
          <div className="space-y-4">
            {monthlyTrend.map((month, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="font-medium">{month.month}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(month.sales / maxMonthlySales) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">UGX {month.sales.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Low Stock Alert */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Low Stock Alert</h3>
        <div className="space-y-3">
          {lowStockItems.length > 0 ? lowStockItems.map((product) => (
            <div key={product.id} className={`flex justify-between items-center p-3 rounded-lg ${
              product.stock === 0 ? 'bg-red-50' : 'bg-yellow-50'
            }`}>
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-600">
                  {product.stock === 0 ? '0 units remaining' : `${product.stock} units remaining`}
                </p>
              </div>
              <Button size="sm" variant="outline">Reorder</Button>
            </div>
          )) : (
            <p className="text-gray-500">All products are well stocked</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Reports;
