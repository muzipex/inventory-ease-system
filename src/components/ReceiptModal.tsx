
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Receipt, Printer, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Sale {
  id: string;
  order_id: string;
  customer_name: string;
  sale_date: string;
  total_amount: number;
  items_count: number;
  status: string;
  payment_method?: string;
  cash_paid?: number;
  debit_balance?: number;
}

interface ReceiptModalProps {
  sale: Sale;
}

const ReceiptModal = ({ sale }: ReceiptModalProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const isPartialPayment = sale.status === 'Partial Payment' || (sale.cash_paid !== undefined && sale.debit_balance !== undefined && sale.debit_balance > 0);

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-content');
    if (printContent) {
      const originalContent = document.body.innerHTML;
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };

  const handleDownload = () => {
    let receiptContent = `
RECEIPT
=====================================
Order ID: ${sale.order_id}
Date: ${sale.sale_date}
Customer: ${sale.customer_name}
=====================================
Items: ${sale.items_count}
Payment Method: ${sale.payment_method || 'Cash'}
Status: ${sale.status}
=====================================`;

    if (isPartialPayment) {
      receiptContent += `
PAYMENT BREAKDOWN:
Cash Paid: UGX ${(sale.cash_paid || 0).toLocaleString()}
Debit Balance: UGX ${(sale.debit_balance || 0).toLocaleString()}
=====================================`;
    }

    receiptContent += `
TOTAL: UGX ${Number(sale.total_amount).toLocaleString()}
=====================================
Thank you for your business!
    `;

    const element = document.createElement('a');
    const file = new Blob([receiptContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `receipt-${sale.order_id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Receipt Downloaded",
      description: `Receipt for ${sale.order_id} has been downloaded`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
          <Receipt className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-gradient-to-br from-white to-gray-50">
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Professional Receipt
          </DialogTitle>
        </DialogHeader>
        
        <div id="receipt-content" className="space-y-4 p-6 bg-white rounded-lg shadow-sm border">
          <div className="text-center border-b-2 border-gray-200 pb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              <h2 className="text-2xl font-bold">SALES RECEIPT</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Inventory Management System</p>
            <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto mt-2"></div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-1">
              <span className="font-semibold text-gray-700">Order ID:</span>
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{sale.order_id}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-semibold text-gray-700">Date:</span>
              <span className="text-gray-800">{sale.sale_date}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-semibold text-gray-700">Customer:</span>
              <span className="text-gray-800 font-medium">{sale.customer_name}</span>
            </div>
          </div>

          <div className="border-t border-b border-gray-200 py-4 space-y-3 bg-gray-50 rounded-lg px-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Items Count:</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">{sale.items_count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Payment Method:</span>
              <span className="capitalize font-medium text-gray-800">{sale.payment_method || 'Cash'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                sale.status === 'Completed' ? 'bg-green-100 text-green-800' :
                sale.status === 'Partial Payment' ? 'bg-orange-100 text-orange-800' :
                sale.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {sale.status}
              </span>
            </div>
          </div>

          {isPartialPayment && (
            <div className="border-2 border-orange-200 rounded-lg p-4 bg-gradient-to-r from-orange-50 to-yellow-50">
              <h4 className="font-bold text-orange-800 mb-3 flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Payment Breakdown
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-orange-700">Cash Paid:</span>
                  <span className="font-bold text-green-700">UGX {(sale.cash_paid || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-orange-700">Outstanding Balance:</span>
                  <span className="font-bold text-red-700">UGX {(sale.debit_balance || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="text-center bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-4">
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              TOTAL: UGX {Number(sale.total_amount).toLocaleString()}
            </div>
            {isPartialPayment && (
              <div className="text-sm text-red-600 mt-2 font-medium">
                ⚠️ Outstanding Balance: UGX {(sale.debit_balance || 0).toLocaleString()}
              </div>
            )}
          </div>

          <div className="text-center text-sm text-gray-600 border-t-2 border-gray-200 pt-4 space-y-2">
            <p className="font-medium text-gray-800">Thank you for your business! 🙏</p>
            {isPartialPayment && (
              <p className="text-red-600 font-medium bg-red-50 p-2 rounded">
                📋 Please settle outstanding balance at your earliest convenience.
              </p>
            )}
            <p className="text-xs text-gray-500">Generated on {new Date().toLocaleString()}</p>
            <div className="w-24 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto"></div>
          </div>
        </div>

        <div className="flex justify-center space-x-4 mt-6">
          <Button 
            onClick={handlePrint} 
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
          >
            <Printer className="h-4 w-4" />
            <span>Print Receipt</span>
          </Button>
          <Button 
            onClick={handleDownload} 
            variant="outline" 
            className="flex items-center space-x-2 border-2 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptModal;
