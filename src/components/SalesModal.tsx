
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QuantityInput from '@/components/QuantityInput';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface SalesModalProps {
  products: Product[];
  onSaleComplete: (sale: any) => void;
}

const SalesModal = ({ products, onSaleComplete }: SalesModalProps) => {
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashPaid, setCashPaid] = useState('');
  const { toast } = useToast();

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        toast({
          title: "Insufficient Stock",
          description: `Only ${product.stock} units available`,
          variant: "destructive"
        });
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }
    
    const product = products.find(p => p.id === productId);
    if (product && newQuantity <= product.stock) {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const resetForm = () => {
    setCart([]);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setPaymentMethod('cash');
    setCashPaid('');
  };

  const handleSaleComplete = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to the cart before completing the sale",
        variant: "destructive"
      });
      return;
    }

    if (!customerName.trim()) {
      toast({
        title: "Customer Name Required",
        description: "Please enter a customer name",
        variant: "destructive"
      });
      return;
    }

    if (!customerEmail.trim()) {
      toast({
        title: "Customer Email Required",
        description: "Please enter a customer email",
        variant: "destructive"
      });
      return;
    }

    if (!customerPhone.trim()) {
      toast({
        title: "Customer Phone Required",
        description: "Please enter a customer phone number",
        variant: "destructive"
      });
      return;
    }

    const total = getTotal();
    let cashAmount = 0;
    let debitBalance = 0;
    let status = 'Completed';

    if (paymentMethod === 'partial') {
      const cashPaidAmount = parseFloat(cashPaid) || 0;
      if (cashPaidAmount <= 0) {
        toast({
          title: "Invalid Cash Amount",
          description: "Please enter a valid cash amount",
          variant: "destructive"
        });
        return;
      }
      if (cashPaidAmount >= total) {
        toast({
          title: "Cash Amount Too High",
          description: "Cash amount cannot be greater than or equal to total. Use 'Cash' payment method instead.",
          variant: "destructive"
        });
        return;
      }
      cashAmount = cashPaidAmount;
      debitBalance = total - cashPaidAmount;
      status = 'Partial Payment';
    } else if (paymentMethod === 'credit') {
      cashAmount = 0;
      debitBalance = total;
      status = 'Pending';
    }

    const sale = {
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      total_amount: total,
      items_count: cart.length,
      status: status,
      payment_method: paymentMethod,
      cash_paid: cashAmount,
      debit_balance: debitBalance,
      cart: cart
    };

    console.log('Completing sale:', sale);

    onSaleComplete(sale);
    resetForm();
    setOpen(false);
    
    toast({
      title: "Sale Completed",
      description: `Sale has been processed successfully`,
    });
  };

  const availableProducts = products.filter(p => p.stock > 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Sale</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Sale</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Available Stock Items</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableProducts.length > 0 ? availableProducts.map(product => (
                <Card key={product.id} className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        UGX {product.price.toLocaleString()} - Stock: {product.stock}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              )) : (
                <p className="text-gray-500">No stock items available</p>
              )}
            </div>
          </div>

          {/* Shopping Cart */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Shopping Cart</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {cart.map(item => (
                <Card key={item.id} className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">UGX {item.price.toLocaleString()} each</p>
                    </div>
                    <QuantityInput
                      value={item.quantity}
                      onChange={(newQuantity) => updateQuantity(item.id, newQuantity)}
                      min={1}
                      max={item.stock}
                    />
                  </div>
                </Card>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span>UGX {getTotal().toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="customer">Customer Name *</Label>
                <Input
                  id="customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Customer Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Enter customer email"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Customer Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter customer phone"
                  required
                />
              </div>

              <div>
                <Label htmlFor="payment">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash (Full Payment)</SelectItem>
                    <SelectItem value="partial">Partial Cash Payment</SelectItem>
                    <SelectItem value="credit">Credit (No Cash)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === 'partial' && (
                <div>
                  <Label htmlFor="cashPaid">Cash Amount Paid</Label>
                  <Input
                    id="cashPaid"
                    type="number"
                    value={cashPaid}
                    onChange={(e) => setCashPaid(e.target.value)}
                    placeholder="Enter cash amount paid"
                    min="1"
                    max={getTotal() - 1}
                  />
                  {cashPaid && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Cash Paid: UGX {parseFloat(cashPaid || '0').toLocaleString()}
                      </p>
                      <p className="text-sm text-blue-800">
                        Outstanding Balance: UGX {(getTotal() - parseFloat(cashPaid || '0')).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'credit' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    Full credit sale - entire amount will be marked as pending payment.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaleComplete}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Complete Sale
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SalesModal;
