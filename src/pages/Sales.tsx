
import React, { useState } from 'react';
import { Search, Calendar, Download, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import SalesModal from '@/components/SalesModal';
import { useToast } from '@/hooks/use-toast';

interface Sale {
  id: string;
  customer: string;
  date: string;
  items: number;
  total: number;
  status: string;
  cart?: any[];
}

const Sales = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Mock sales data with state management
  const [sales, setSales] = useState<Sale[]>([
    {
      id: 'ORD-001',
      customer: 'John Doe',
      date: '2024-01-15',
      items: 3,
      total: 299.97,
      status: 'Completed'
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      date: '2024-01-14',
      items: 1,
      total: 59.99,
      status: 'Completed'
    },
    {
      id: 'ORD-003',
      customer: 'Bob Johnson',
      date: '2024-01-14',
      items: 2,
      total: 139.98,
      status: 'Pending'
    },
    {
      id: 'ORD-004',
      customer: 'Alice Brown',
      date: '2024-01-13',
      items: 4,
      total: 189.96,
      status: 'Completed'
    }
  ]);

  // Mock products for sales modal
  const products = [
    { id: 1, name: 'Wireless Headphones', sku: 'WH-001', price: 99.99, stock: 45 },
    { id: 2, name: 'Gaming Mouse', sku: 'GM-002', price: 59.99, stock: 8 },
    { id: 3, name: 'Coffee Mug', sku: 'CM-003', price: 12.99, stock: 120 },
    { id: 4, name: 'Desk Lamp', sku: 'DL-004', price: 34.99, stock: 15 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSaleComplete = (sale: Sale) => {
    setSales([sale, ...sales]);
  };

  const handleViewReceipt = (sale: Sale) => {
    toast({
      title: "Receipt",
      description: `Viewing receipt for order ${sale.id}`,
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Sales data export has been initiated",
    });
  };

  const filteredSales = sales.filter(sale =>
    sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todaysSales = sales
    .filter(sale => sale.date === new Date().toISOString().split('T')[0])
    .reduce((total, sale) => total + sale.total, 0);

  const todaysOrders = sales.filter(sale => sale.date === new Date().toISOString().split('T')[0]).length;

  const monthSales = sales.reduce((total, sale) => total + sale.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
        <SalesModal products={products} onSaleComplete={handleSaleComplete} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="text-2xl font-bold text-gray-900">${todaysSales.toFixed(2)}</div>
          <div className="text-sm text-gray-500">Today's Sales</div>
        </Card>
        <Card className="p-6">
          <div className="text-2xl font-bold text-gray-900">{todaysOrders}</div>
          <div className="text-sm text-gray-500">Orders Today</div>
        </Card>
        <Card className="p-6">
          <div className="text-2xl font-bold text-gray-900">${monthSales.toFixed(2)}</div>
          <div className="text-sm text-gray-500">This Month</div>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by order ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
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
      </Card>

      {/* Sales Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sale.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.items}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${sale.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sale.status)}`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewReceipt(sale)}>
                        <Receipt className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Sales;
