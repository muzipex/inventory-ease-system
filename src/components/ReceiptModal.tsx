
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
        <Button variant="ghost" size="sm">
          <Receipt className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Receipt</DialogTitle>
        </DialogHeader>
        
        <div id="receipt-content" className="space-y-4 p-6 bg-white">
          <div className="text-center border-b pb-4">
            <h2 className="text-xl font-bold">SALES RECEIPT</h2>
            <p className="text-sm text-gray-600">Inventory Management System</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Order ID:</span>
              <span>{sale.order_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date:</span>
              <span>{sale.sale_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Customer:</span>
              <span>{sale.customer_name}</span>
            </div>
          </div>

          <div className="border-t border-b py-4 space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Items:</span>
              <span>{sale.items_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Payment Method:</span>
              <span>{sale.payment_method || 'Cash'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span className={`px-2 py-1 rounded text-xs ${
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
            <div className="border-t border-b py-4 space-y-2 bg-orange-50">
              <h4 className="font-semibold text-orange-800">Payment Breakdown:</h4>
              <div className="flex justify-between">
                <span className="font-medium text-orange-700">Cash Paid:</span>
                <span className="text-orange-700">UGX {(sale.cash_paid || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-red-700">Debit Balance:</span>
                <span className="text-red-700">UGX {(sale.debit_balance || 0).toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="text-center">
            <div className="text-2xl font-bold">
              TOTAL: UGX {Number(sale.total_amount).toLocaleString()}
            </div>
            {isPartialPayment && (
              <div className="text-sm text-red-600 mt-2">
                Outstanding Balance: UGX {(sale.debit_balance || 0).toLocaleString()}
              </div>
            )}
          </div>

          <div className="text-center text-sm text-gray-600 border-t pt-4">
            <p>Thank you for your business!</p>
            {isPartialPayment && (
              <p className="text-red-600 font-medium">Please settle outstanding balance soon.</p>
            )}
            <p>Generated on {new Date().toLocaleString()}</p>
          </div>
        </div>

        <div className="flex justify-center space-x-4 mt-6">
          <Button onClick={handlePrint} className="flex items-center space-x-2">
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </Button>
          <Button onClick={handleDownload} variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptModal;
