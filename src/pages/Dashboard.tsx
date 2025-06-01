
import React from 'react';
import { Package, TrendingUp, ShoppingCart, Users, DollarSign, AlertTriangle, CreditCard } from 'lucide-react';
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
        <div className="text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Loading dashboard...
        </div>
      </div>
    );
  }

  const totalProducts = products.length;
  const totalSales = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const totalOrders = sales.length;
  const lowStockItems = products.filter(product => product.stock <= product.min_stock);

  // Calculate partial payment metrics
  const partialPaymentSales = sales.filter(sale => 
    sale.status === 'Partial Payment' || (sale as any).payment_method === 'partial'
  );
  const totalDebitBalance = partialPaymentSales.reduce((sum, sale) => {
    // Use debit_balance if available, otherwise estimate
    const debitBalance = (sale as any).debit_balance;
    if (debitBalance) {
      return sum + Number(debitBalance);
    }
    // Estimate debit balance if not stored directly
    if ((sale as any).payment_method === 'partial') {
      return sum + (Number(sale.total_amount) * 0.3); // Assuming 30% average debit
    }
    return sum;
  }, 0);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const todaysSales = sales
    .filter(sale => sale.sale_date === today)
    .reduce((total, sale) => total + Number(sale.total_amount), 0);
  const todaysOrders = sales.filter(sale => sale.sale_date === today).length;

  const recentSales = sales.slice(0, 4);
  const lowStockAlerts = lowStockItems.slice(0, 4);

  // Get customers with partial payments
  const customersWithDebt = customers.filter(customer => {
    const customerSales = sales.filter(sale => 
      sale.customer_name === customer.name && 
      (sale.status === 'Partial Payment' || (sale as any).payment_method === 'partial')
    );
    return customerSales.length > 0;
  }).slice(0, 4);

  const stats = [
    {
      title: 'Total Products',
      value: totalProducts.toString(),
      change: '+12%',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100'
    },
    {
      title: 'Total Sales',
      value: `UGX ${totalSales.toLocaleString()}`,
      change: '+8%',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100'
    },
    {
      title: 'Orders',
      value: totalOrders.toString(),
      change: '+15%',
      icon: ShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100'
    },
    {
      title: 'Partial Payments',
      value: partialPaymentSales.length.toString(),
      change: `UGX ${totalDebitBalance.toLocaleString()} debt`,
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <div className="text-sm text-gray-500">
          Welcome back! Here's what's happening with your inventory.
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-all duration-200 border-0 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm ${
                  stat.title === 'Partial Payments' ? 'text-purple-600' :
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 shadow-md hover:shadow-lg transition-all duration-200">
          <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Recent Sales
          </h3>
          <div className="space-y-4">
            {recentSales.length > 0 ? recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                <div>
                  <p className="font-medium">{sale.order_id}</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-500">{sale.customer_name}</p>
                    {(sale.status === 'Partial Payment' || (sale as any).payment_method === 'partial') && (
                      <span className="px-2 py-1 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 text-xs rounded-full border border-orange-200">
                        Partial
                      </span>
                    )}
                  </div>
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

        <Card className="p-6 shadow-md hover:shadow-lg transition-all duration-200">
          <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Customers with Outstanding Balance
          </h3>
          <div className="space-y-4">
            {customersWithDebt.length > 0 ? customersWithDebt.map((customer) => {
              const customerPartialSales = sales.filter(sale => 
                sale.customer_name === customer.name && 
                (sale.status === 'Partial Payment' || (sale as any).payment_method === 'partial')
              ).length;
              
              return (
                <div key={customer.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-gray-500">{customerPartialSales} partial payment(s)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-orange-600">Follow up</p>
                    <p className="text-sm text-gray-500">Outstanding debt</p>
                  </div>
                </div>
              );
            }) : (
              <p className="text-gray-500">No outstanding balances</p>
            )}
          </div>
        </Card>
      </div>

      {/* Low Stock Alert */}
      <Card className="p-6 shadow-md hover:shadow-lg transition-all duration-200">
        <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
          Low Stock Alerts
        </h3>
        <div className="space-y-4">
          {lowStockAlerts.length > 0 ? lowStockAlerts.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></div>
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
  );
};

export default Dashboard;
