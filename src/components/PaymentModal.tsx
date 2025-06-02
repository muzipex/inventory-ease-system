
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentModalProps {
  sale: any;
  onPaymentComplete: (saleId: string, paymentAmount: number, paymentMethod: string) => void;
}

const PaymentModal = ({ sale, onPaymentComplete }: PaymentModalProps) => {
  const [open, setOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const { toast } = useToast();

  const remainingBalance = Number(sale.debit_balance || 0);

  const handlePayment = () => {
    const amount = parseFloat(paymentAmount);
    
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "destructive"
      });
      return;
    }

    if (amount > remainingBalance) {
      toast({
        title: "Amount Too High",
        description: "Payment amount cannot exceed the outstanding balance",
        variant: "destructive"
      });
      return;
    }

    onPaymentComplete(sale.id, amount, paymentMethod);
    setOpen(false);
    setPaymentAmount('');
    setPaymentMethod('cash');
    
    toast({
      title: "Payment Recorded",
      description: `Payment of UGX ${amount.toLocaleString()} has been recorded successfully`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="flex items-center space-x-1">
          <CreditCard className="h-3 w-3" />
          <span>Record Payment</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Customer:</span>
                <span className="text-sm font-medium">{sale.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Order ID:</span>
                <span className="text-sm font-medium">{sale.order_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Outstanding Balance:</span>
                <span className="text-sm font-medium text-red-600">
                  UGX {remainingBalance.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          <div>
            <Label htmlFor="amount">Payment Amount</Label>
            <Input
              id="amount"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Enter payment amount"
              max={remainingBalance}
              min="1"
            />
          </div>

          <div>
            <Label htmlFor="method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentAmount && (
            <Card className="p-3 bg-green-50 border-green-200">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Payment Amount:</span>
                  <span className="font-medium">UGX {parseFloat(paymentAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining Balance:</span>
                  <span className="font-medium">
                    UGX {(remainingBalance - parseFloat(paymentAmount)).toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePayment}>
              <DollarSign className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
