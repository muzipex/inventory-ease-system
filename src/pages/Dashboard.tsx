
import React from 'react';
import { Package, TrendingUp, ShoppingCart, Users, DollarSign, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { useCustomers } from '@/hooks/useCustomers';

const Dashboard = () => {
  const { products, loading: productsLoading } = useProducts();
  const { sales, loading: salesLoading } = useSales();
  const { customers, loading: customersLoading } = useCustomers();

  if (productsLoading || salesLoading || customersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  const totalProducts = products.length;
  const totalSales = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const totalOrders = sales.length;
  const lowStockItems = products.filter(product => product.stock <= product.min_stock);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const todaysSales = sales
    .filter(sale => sale.sale_date === today)
    .reduce((total, sale) => total + Number(sale.total_amount), 0);
  const todaysOrders = sales.filter(sale => sale.sale_date === today).length;

  const recentSales = sales.slice(0, 4);
  const lowStockAlerts = lowStockItems.slice(0, 4);

  const stats = [
    {
      title: 'Total Products',
      value: totalProducts.toString(),
      change: '+12%',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Sales',
      value: `UGX ${totalSales.toLocaleString()}`,
      change: '+8%',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Orders',
      value: totalOrders.toString(),
      change: '+15%',
      icon: ShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Low Stock Items',
      value: lowStockItems.length.toString(),
      change: '-5%',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome back! Here's what's happening with your inventory.
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} from last month
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Sales</h3>
          <div className="space-y-4">
            {recentSales.length > 0 ? recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{sale.order_id}</p>
                  <p className="text-sm text-gray-500">{sale.customer_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">UGX {Number(sale.total_amount).toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Items: {sale.items_count}</p>
                </div>
              </div>
            )) : (
              <p className="text-gray-500">No sales yet</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Low Stock Alerts</h3>
          <div className="space-y-4">
            {lowStockAlerts.length > 0 ? lowStockAlerts.map((product) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">Category: {product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-600">{product.stock} left</p>
                  <p className="text-sm text-gray-500">Min: {product.min_stock}</p>
                </div>
              </div>
            )) : (
              <p className="text-gray-500">No low stock items</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
