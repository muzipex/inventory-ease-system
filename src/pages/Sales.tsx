import React, { useState } from 'react';
import { Search, Calendar, Download, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SalesModal from '@/components/SalesModal';
import ReceiptModal from '@/components/ReceiptModal';
import { useToast } from '@/hooks/use-toast';
import { useSales } from '@/hooks/useSales';
import { useProducts } from '@/hooks/useProducts';

const Sales = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const { toast } = useToast();
  const { sales, loading: salesLoading, error: salesError, addSale } = useSales();
  const { products, loading: productsLoading } = useProducts();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700';
      case 'Pending':
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/50 dark:to-yellow-800/50 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700';
      case 'Partial Payment':
        return 'bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/50 dark:to-orange-800/50 text-orange-800 dark:text-orange-200 border border-orange-300 dark:border-orange-700';
      case 'Cancelled':
        return 'bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/50 dark:to-red-800/50 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800/50 dark:to-gray-700/50 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600';
    }
  };

  const handleSaleComplete = async (saleData: any) => {
    try {
      await addSale({
        order_id: saleData.order_id,
        customer_name: saleData.customer_name,
        total_amount: saleData.total_amount,
        items_count: saleData.cart.length,
        status: saleData.status,
        payment_method: saleData.payment_method,
        cash_paid: saleData.cash_paid || null,
        debit_balance: saleData.debit_balance || null
      }, saleData.cart.map((item: any) => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      })));

      toast({
        title: "Sale Completed",
        description: `Order ${saleData.order_id} has been processed successfully. You can view and download the receipt from the sales table.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to process sale",
        variant: "destructive"
      });
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Order ID,Customer,Date,Items,Total,Status,Payment Method\n"
      + filteredSales.map(sale => 
          `${sale.order_id},${sale.customer_name},${sale.sale_date},${sale.items_count},${sale.total_amount},${sale.status},${(sale as any).payment_method || 'N/A'}`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sales_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: "Sales data has been downloaded as CSV",
    });
  };

  const filterSalesByDate = (sales: any[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    const thisMonth = new Date(today);
    thisMonth.setMonth(thisMonth.getMonth() - 1);

    return sales.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      switch (dateRange) {
        case 'today':
          return saleDate >= today;
        case 'yesterday':
          return saleDate >= yesterday && saleDate < today;
        case 'thisWeek':
          return saleDate >= thisWeek;
        case 'thisMonth':
          return saleDate >= thisMonth;
        default:
          return true;
      }
    });
  };

  const filteredSales = filterSalesByDate(sales).filter(sale =>
    sale.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const today = new Date().toISOString().split('T')[0];
  const todaysSales = sales
    .filter(sale => sale.sale_date === today)
    .reduce((total, sale) => total + Number(sale.total_amount), 0);

  const todaysOrders = sales.filter(sale => sale.sale_date === today).length;
  const monthSales = sales.reduce((total, sale) => total + Number(sale.total_amount), 0);

  // Map products to match the interface expected by SalesModal
  const mappedProducts = products.map(product => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    price: Number(product.price),
    stock: product.stock
  }));

  if (salesLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
          Loading...
        </div>
      </div>
    );
  }

  if (salesError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600 dark:text-red-400">Error: {salesError}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
          Sales Management
        </h1>
        <SalesModal products={mappedProducts} onSaleComplete={handleSaleComplete} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-0 shadow-md hover:shadow-lg transition-all duration-200">
          <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent">
            UGX {todaysSales.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Today's Sales</div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-0 shadow-md hover:shadow-lg transition-all duration-200">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
            {todaysOrders}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Orders Today</div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-0 shadow-md hover:shadow-lg transition-all duration-200">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent">
            UGX {monthSales.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Sales</div>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <Card className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border-0 shadow-md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search by order ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-0 bg-white dark:bg-gray-800 shadow-sm"
            />
          </div>
          <div className="flex space-x-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40 border-0 bg-white dark:bg-gray-800 shadow-sm">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="thisWeek">This Week</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              className="flex items-center space-x-2 border-0 bg-white dark:bg-gray-800 shadow-sm hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600" 
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Sales Table */}
      <Card className="shadow-md hover:shadow-lg transition-all duration-200 dark:bg-gray-800/50">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Receipt
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700/50 dark:hover:to-gray-600/50 transition-all duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {sale.order_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {sale.customer_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {sale.sale_date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {sale.items_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    UGX {Number(sale.total_amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {(sale as any).payment_method || 'Cash'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sale.status)}`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <ReceiptModal sale={sale} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSales.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No sales found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search terms or create a new sale.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Sales;
