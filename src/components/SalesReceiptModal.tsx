
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Download, Receipt } from 'lucide-react';
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

interface SalesReceiptModalProps {
  sale: Sale;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SalesReceiptModal = ({ sale, open, onOpenChange }: SalesReceiptModalProps) => {
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
    const printContent = document.getElementById('sales-receipt-content');
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

SALES RECEIPT
=====================================
Date: ${sale.sale_date}
Order No.: ${sale.order_id}

Customer: ${sale.customer_name}

Items Purchased: ${sale.items_count}
Total Amount: UGX ${Number(sale.total_amount).toLocaleString()}
Payment Method: ${sale.payment_method || 'Cash'}
Status: ${sale.status}
=====================================`;

    if (isPartialPayment) {
      receiptContent += `
PAYMENT BREAKDOWN:
Cash Paid: UGX ${(sale.cash_paid || 0).toLocaleString()}
Outstanding Balance: UGX ${(sale.debit_balance || 0).toLocaleString()}
=====================================`;
    }

    receiptContent += `
Amount in words: ${convertNumberToWords(Number(sale.total_amount))}

Thank you for your business!
NGABIRANO'S BLOCKS AND CONCRETE PRODUCTS
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <span>Sales Receipt</span>
          </DialogTitle>
        </DialogHeader>
        
        <div id="sales-receipt-content" className="bg-white p-6" style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px', lineHeight: '1.3' }}>
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

          <div className="font-bold text-center underline my-2 text-base">SALES RECEIPT</div>

          <div className="flex justify-between mb-2">
            <div>Date: {sale.sale_date}</div>
            <div>Order No.: {sale.order_id}</div>
          </div>

          <div className="mb-2">Customer: {sale.customer_name}</div>

          <table className="w-full border-collapse my-2 text-sm" style={{ border: '1px solid #000' }}>
            <thead>
              <tr>
                <th className="border border-black p-1 bg-gray-100 text-left">Description</th>
                <th className="border border-black p-1 bg-gray-100 text-left">Quantity</th>
                <th className="border border-black p-1 bg-gray-100 text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-1">
                  Mixed Items ({sale.payment_method === 'credit' || isPartialPayment ? 'Credit sale' : 'Cash sale'})
                </td>
                <td className="border border-black p-1">{sale.items_count}</td>
                <td className="border border-black p-1">UGX {Number(sale.total_amount).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold" colspan="2">TOTAL:</td>
                <td className="border border-black p-2 font-bold">UGX {Number(sale.total_amount).toLocaleString()}</td>
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
            Amount in words: {convertNumberToWords(Number(sale.total_amount))}
          </div>

          <div className="mt-8 text-center">
            <div className="mb-3">Thank you for your business!</div>
            <div className="uppercase font-bold">NGABIRANO'S BLOCKS AND CONCRETE PRODUCTS</div>
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

export default SalesReceiptModal;
