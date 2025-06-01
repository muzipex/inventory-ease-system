
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

  const convertNumberToWords = (amount: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', 'Thousand', 'Million', 'Billion'];

    if (amount === 0) return 'Zero Shillings only';

    const convertHundreds = (num: number): string => {
      let result = '';
      
      if (num >= 100) {
        result += ones[Math.floor(num / 100)] + ' Hundred ';
        num %= 100;
      }
      
      if (num >= 20) {
        result += tens[Math.floor(num / 10)] + ' ';
        num %= 10;
      } else if (num >= 10) {
        result += teens[num - 10] + ' ';
        return result;
      }
      
      if (num > 0) {
        result += ones[num] + ' ';
      }
      
      return result;
    };

    let result = '';
    let thousandCounter = 0;
    
    while (amount > 0) {
      if (amount % 1000 !== 0) {
        result = convertHundreds(amount % 1000) + thousands[thousandCounter] + ' ' + result;
      }
      amount = Math.floor(amount / 1000);
      thousandCounter++;
    }
    
    return result.trim() + ' Shillings only';
  };

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
NGABIRANO'S BLOCKS AND CONCRETE PRODUCTS
=====================================
NGABIRANO Location: Bukasa B, Vlakiso off Kiseka road 800m Watoto Road.
Sales outlet: Sentema road just after Bukasa Trading Centre
Tel:0706720952, Whatsapp:078200404

INVOICE
=====================================
Date: ${sale.sale_date}
No.: ${sale.order_id}

MS: ${sale.customer_name}

Items: ${sale.items_count}
Total: UGX ${Number(sale.total_amount).toLocaleString()}
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
Amount in words...${convertNumberToWords(Number(sale.total_amount))}

Signed...
NGABIRANO'S BLOCKS AND CONCRETE PRODUCTS
    `;

    const element = document.createElement('a');
    const file = new Blob([receiptContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `invoice-${sale.order_id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Invoice Downloaded",
      description: `Invoice for ${sale.order_id} has been downloaded`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
          <Receipt className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice</DialogTitle>
        </DialogHeader>
        
        <div id="receipt-content" className="bg-white p-6" style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px', lineHeight: '1.3' }}>
          <div className="text-center mb-2 font-bold">
            <div className="text-base uppercase mb-1">
              NGABIRANO'S BLOCKS AND<br />CONCRETE PRODUCTS
            </div>
            <div className="text-xs text-center mb-3">
              NGABIRANO Location: Bukasa B, Vlakiso off Kiseka road 800m Watoto Road.<br />
              Sales outlet: Sentema road just after Bukasa Trading Centre<br />
              Tel:0706720952, Whatsapp:078200404
            </div>
          </div>

          <div className="font-bold text-center underline my-2 text-base">INVOICE</div>

          <div className="flex justify-between mb-2">
            <div>Date: {sale.sale_date}</div>
            <div>No.: {sale.order_id}</div>
          </div>

          <div className="mb-2">MS: {sale.customer_name}</div>

          <table className="w-full border-collapse my-2 text-sm" style={{ border: '1px solid #000' }}>
            <thead>
              <tr>
                <th className="border border-black p-1 bg-gray-100 text-left">SN</th>
                <th className="border border-black p-1 bg-gray-100 text-left">Description</th>
                <th className="border border-black p-1 bg-gray-100 text-left">Qty</th>
                <th className="border border-black p-1 bg-gray-100 text-left">Unit Price</th>
                <th className="border border-black p-1 bg-gray-100 text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-1">1</td>
                <td className="border border-black p-1">
                  Sales Items ({sale.payment_method === 'credit' || isPartialPayment ? 'Credit sale' : 'Cash sale'})
                </td>
                <td className="border border-black p-1">{sale.items_count}</td>
                <td className="border border-black p-1">Various</td>
                <td className="border border-black p-1">UGX {Number(sale.total_amount).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          {isPartialPayment && (
            <div className="my-2 p-2 border border-orange-300 rounded bg-orange-50">
              <div className="font-bold text-orange-800 mb-1">Payment Breakdown:</div>
              <div className="text-sm">
                <div>Cash Paid: UGX {(sale.cash_paid || 0).toLocaleString()}</div>
                <div>Outstanding Balance: UGX {(sale.debit_balance || 0).toLocaleString()}</div>
              </div>
            </div>
          )}

          <div className="mt-1 text-sm italic">
            Amount in words...{convertNumberToWords(Number(sale.total_amount))}
          </div>

          <div className="mt-8 text-center font-bold">
            <div className="mb-3">Signed...</div>
            <div className="uppercase">NGABIRANO'S BLOCKS AND CONCRETE PRODUCTS</div>
          </div>

          {isPartialPayment && (
            <div className="mt-4 text-center text-red-600 font-medium bg-red-50 p-2 rounded">
              ⚠️ Outstanding Balance: UGX {(sale.debit_balance || 0).toLocaleString()}
            </div>
          )}

          <div className="text-center text-xs text-gray-500 mt-4">
            Generated on {new Date().toLocaleString()}
          </div>
        </div>

        <div className="flex justify-center space-x-4 mt-6">
          <Button 
            onClick={handlePrint} 
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
          >
            <Printer className="h-4 w-4" />
            <span>Print Invoice</span>
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
