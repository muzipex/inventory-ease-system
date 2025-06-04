
import React, { useState } from 'react';
import { Package, TrendingUp, ShoppingCart, Users, DollarSign, AlertTriangle, CreditCard } from 'lucide-react';
import { Card } from '@/components/ui/card';
import LowStockAlert from '@/components/LowStockAlert';
import AgingInventory from '@/components/AgingInventory';
import SalesReceiptModal from '@/components/SalesReceiptModal';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { useCustomers } from '@/hooks/useCustomers';
import { useExpenses } from '@/hooks/useExpenses';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { products, loading: productsLoading } = useProducts();
  const { sales, loading: salesLoading } = useSales();
  const { customers, loading: customersLoading } = useCustomers();
  const { expenses, loading: expensesLoading } = useExpenses();
  const { toast } = useToast();
  const [selectedSale, setSelectedSale] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  if (productsLoading || salesLoading || customersLoading || expensesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Loading dashboard...
        </div>
      </div>
    );
  }

  const totalProducts = products.length;
  const totalPaidSales = sales
    .filter(sale => sale.status === 'Completed')
    .reduce((sum, sale) => sum + Number(sale.cash_paid || sale.total_amount), 0);
  const totalOrders = sales.length;
  const lowStockItems = products.filter(product => product.stock <= product.min_stock);

  const pendingPaymentSales = sales.filter(sale => 
    sale.status === 'Pending' || sale.status === 'Partial Payment'
  );
  const totalPendingBalance = pendingPaymentSales.reduce((sum, sale) => 
    sum + Number(sale.debit_balance || (sale.status === 'Pending' ? sale.total_amount : 0)), 0);

  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  const today = new Date().toISOString().split('T')[0];
  const todaysSales = sales.filter(sale => sale.sale_date === today);
  const todaysPaidSales = todaysSales
    .filter(sale => sale.status === 'Completed')
    .reduce((total, sale) => total + Number(sale.cash_paid || sale.total_amount), 0);
  const todaysOrders = todaysSales.length;

  const recentSales = sales.slice(0, 4);
  const lowStockAlerts = lowStockItems.slice(0, 4);

  const customersWithDebt = customers.filter(customer => {
    const customerPendingSales = sales.filter(sale => 
      sale.customer_name === customer.name && 
      (sale.status === 'Pending' || sale.status === 'Partial Payment')
    );
    return customerPendingSales.length > 0;
  }).slice(0, 4);

  const handleCardClick = (type: string) => {
    let message = '';
    switch (type) {
      case 'products':
        message = `${totalProducts} products in inventory, ${lowStockItems.length} need attention`;
        break;
      case 'sales':
        message = `Total paid sales: UGX ${totalPaidSales.toLocaleString()}`;
        break;
      case 'orders':
        message = `${totalOrders} total orders, ${todaysOrders} today`;
        break;
      case 'pending':
        message = `${pendingPaymentSales.length} pending payments worth UGX ${totalPendingBalance.toLocaleString()}`;
        break;
      case 'expenses':
        message = `Total expenses: UGX ${totalExpenses.toLocaleString()}`;
        break;
    }
    
    toast({
      title: "Quick Report",
      description: message,
    });
  };

  const handleSaleClick = (sale: any) => {
    setSelectedSale(sale);
    setReceiptModalOpen(true);
  };

  const stats = [
    {
      title: 'Total Products',
      value: totalProducts.toString(),
      change: `${lowStockItems.length} low stock`,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      type: 'products'
    },
    {
      title: 'Paid Sales',
      value: `UGX ${totalPaidSales.toLocaleString()}`,
      change: `UGX ${todaysPaidSales.toLocaleString()} today`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      type: 'sales'
    },
    {
      title: 'Total Orders',
      value: totalOrders.toString(),
      change: `${todaysOrders} today`,
      icon: ShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
      type: 'orders'
    },
    {
      title: 'Pending Payments',
      value: pendingPaymentSales.length.toString(),
      change: `UGX ${totalPendingBalance.toLocaleString()} owed`,
      icon: CreditCard,
      color: 'text-red-600',
      bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
      type: 'pending'
    },
    {
      title: 'Total Expenses',
      value: `UGX ${totalExpenses.toLocaleString()}`,
      change: 'all time',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      type: 'expenses'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <div className="text-sm text-gray-500">
          Welcome back! Here's what's happening with your business.
        </div>
      </div>

      {/* Alerts Section */}
      <div className="space-y-4">
        <LowStockAlert products={products} />
        <AgingInventory />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className="p-6 hover:shadow-lg transition-all duration-200 border-0 shadow-md cursor-pointer hover:scale-105"
            onClick={() => handleCardClick(stat.type)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm ${
                  stat.title === 'Pending Payments' ? 'text-red-600' :
                  stat.title === 'Total Products' && lowStockItems.length > 0 ? 'text-orange-600' :
                  'text-green-600'
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
        <Card 
          className="p-6 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Recent Sales (Click for Receipt)
          </h3>
          <div className="space-y-4">
            {recentSales.length > 0 ? recentSales.map((sale) => (
              <div 
                key={sale.id} 
                className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg cursor-pointer hover:from-blue-50 hover:to-blue-100 transition-all duration-200"
                onClick={() => handleSaleClick(sale)}
              >
                <div>
                  <p className="font-medium">{sale.order_id}</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-500">{sale.customer_name}</p>
                    {(sale.status === 'Partial Payment' || sale.status === 'Pending') && (
                      <span className={`px-2 py-1 text-xs rounded-full border ${
                        sale.status === 'Pending' 
                          ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-200'
                          : 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 border-orange-200'
                      }`}>
                        {sale.status === 'Pending' ? 'Credit' : 'Partial'}
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

        <Card 
          className="p-6 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
          onClick={() => handleCardClick('pending')}
        >
          <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Customers with Outstanding Balance
          </h3>
          <div className="space-y-4">
            {customersWithDebt.length > 0 ? customersWithDebt.map((customer) => {
              const customerPendingSales = sales.filter(sale => 
                sale.customer_name === customer.name && 
                (sale.status === 'Pending' || sale.status === 'Partial Payment')
              );
              
              const totalOwed = customerPendingSales.reduce((sum, sale) => 
                sum + Number(sale.debit_balance || (sale.status === 'Pending' ? sale.total_amount : 0)), 0);
              
              return (
                <div key={customer.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-gray-500">{customerPendingSales.length} pending payment(s)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">UGX {totalOwed.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Outstanding</p>
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
      <Card 
        className="p-6 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
        onClick={() => handleCardClick('products')}
      >
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

      {/* Sales Receipt Modal */}
      {selectedSale && (
        <SalesReceiptModal
          sale={selectedSale}
          open={receiptModalOpen}
          onOpenChange={setReceiptModalOpen}
        />
      )}
    </div>
  );
};

export default Dashboard;
