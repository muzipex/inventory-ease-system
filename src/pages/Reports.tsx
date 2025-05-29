
import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart3, TrendingUp, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Reports = () => {
  const reportData = {
    salesGrowth: '+15.3%',
    inventory: '87%',
    topProducts: [
      { name: 'Wireless Headphones', sales: 45, revenue: 4499.55 },
      { name: 'Gaming Mouse', sales: 32, revenue: 1919.68 },
      { name: 'Coffee Mug', sales: 89, revenue: 1156.11 },
    ],
    monthlySales: [
      { month: 'Jan', sales: 12500 },
      { month: 'Feb', sales: 15200 },
      { month: 'Mar', sales: 18300 },
      { month: 'Apr', sales: 21100 },
    ]
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
          <Button variant="outline" className="flex items-center space-x-2">
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
              <p className="text-2xl font-bold text-green-600">{reportData.salesGrowth}</p>
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
              <p className="text-2xl font-bold text-blue-600">{reportData.inventory}</p>
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
              <p className="text-2xl font-bold text-gray-900">$67,890</p>
              <p className="text-sm text-gray-500">this month</p>
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
          <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
          <div className="space-y-4">
            {reportData.topProducts.map((product, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.sales} units sold</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${product.revenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">revenue</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Monthly Sales Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Sales Trend</h3>
          <div className="space-y-4">
            {reportData.monthlySales.map((month, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="font-medium">{month.month}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(month.sales / 25000) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">${month.sales.toLocaleString()}</span>
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
          <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
            <div>
              <p className="font-medium">Gaming Mouse</p>
              <p className="text-sm text-gray-600">8 units remaining</p>
            </div>
            <Button size="sm" variant="outline">Reorder</Button>
          </div>
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
            <div>
              <p className="font-medium">Desk Lamp</p>
              <p className="text-sm text-gray-600">0 units remaining</p>
            </div>
            <Button size="sm" variant="outline">Reorder</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
