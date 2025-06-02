
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Receipt, CreditCard, Calendar } from 'lucide-react';

interface CustomerAccountModalProps {
  customer: any;
  sales: any[];
}

const CustomerAccountModal = ({ customer, sales }: CustomerAccountModalProps) => {
  const [open, setOpen] = useState(false);

  const customerSales = sales.filter(sale => sale.customer_name === customer.name);
  const pendingSales = customerSales.filter(sale => 
    sale.status === 'Pending' || sale.status === 'Partial Payment'
  );
  
  const totalOutstanding = pendingSales.reduce((sum, sale) => 
    sum + Number(sale.debit_balance || 0), 0
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Partial Payment':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="flex items-center space-x-1">
          <User className="h-3 w-3" />
          <span>View Account</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Account - {customer.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Customer Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="text-lg font-bold text-blue-800">
                {customer.total_orders}
              </div>
              <div className="text-sm text-blue-600">Total Orders</div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
              <div className="text-lg font-bold text-green-800">
                UGX {Number(customer.total_spent).toLocaleString()}
              </div>
              <div className="text-sm text-green-600">Total Spent</div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100">
              <div className="text-lg font-bold text-red-800">
                UGX {totalOutstanding.toLocaleString()}
              </div>
              <div className="text-sm text-red-600">Outstanding Balance</div>
            </Card>
          </div>

          {/* Contact Information */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Contact Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span>{customer.email || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span>{customer.phone || 'Not provided'}</span>
              </div>
            </div>
          </Card>

          {/* Recent Orders */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <Receipt className="h-4 w-4 mr-2" />
              Recent Orders
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {customerSales.length > 0 ? customerSales.slice(0, 10).map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{sale.order_id}</div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {sale.sale_date}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">
                      UGX {Number(sale.total_amount).toLocaleString()}
                    </div>
                    <Badge className={`text-xs ${getStatusColor(sale.status)}`}>
                      {sale.status}
                    </Badge>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-sm">No orders found</p>
              )}
            </div>
          </Card>

          {/* Outstanding Payments */}
          {pendingSales.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Outstanding Payments
              </h3>
              <div className="space-y-2">
                {pendingSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
                    <div>
                      <div className="font-medium text-sm">{sale.order_id}</div>
                      <div className="text-xs text-gray-500">{sale.sale_date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm text-red-600">
                        UGX {Number(sale.debit_balance || sale.total_amount).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Outstanding</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerAccountModal;
