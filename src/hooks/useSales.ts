import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Sale = Database['public']['Tables']['sales']['Row'];

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    
    // Initial fetch
    const fetchSales = async () => {
      try {
        console.log('Fetching sales data...');
        const { data, error } = await supabase
          .from('sales')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching sales:', error);
          throw error;
        }
        
        if (isMounted) {
          console.log('Sales fetched successfully:', data?.length || 0, 'records');
          setSales(data || []);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to fetch sales:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSales();

    // Set up real-time subscription
    const channel = supabase
      .channel('sales-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales'
        },
        (payload) => {
          console.log('Sale change received:', payload);
          
          if (!isMounted) return;
          
          if (payload.eventType === 'INSERT') {
            setSales(prev => [payload.new as Sale, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setSales(prev => 
              prev.map(sale => 
                sale.id === payload.new.id ? payload.new as Sale : sale
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setSales(prev => 
              prev.filter(sale => sale.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const generateOrderId = () => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = today.getTime().toString().slice(-3);
    return `${dateStr}-${timeStr}`;
  };

  const addSale = async (saleData: {
    customer_name: string;
    customer_email?: string;
    customer_phone?: string;
    total_amount: number;
    items_count: number;
    status?: string;
    sale_date?: string;
    payment_method?: string;
    cash_paid?: number;
    debit_balance?: number;
  }, items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>) => {
    try {
      console.log('Adding new sale:', saleData);
      
      const orderId = generateOrderId();
      
      // Determine correct status based on payment method
      let status = 'Completed';
      let cashPaid = saleData.total_amount;
      let debitBalance = 0;
      
      if (saleData.payment_method === 'credit') {
        status = 'Pending';
        cashPaid = 0;
        debitBalance = saleData.total_amount;
      } else if (saleData.payment_method === 'partial') {
        status = 'Partial Payment';
        cashPaid = saleData.cash_paid || 0;
        debitBalance = saleData.total_amount - cashPaid;
      }

      // Prepare sale data for insertion
      const saleToInsert = {
        order_id: orderId,
        customer_name: saleData.customer_name,
        total_amount: saleData.total_amount,
        items_count: saleData.items_count,
        status: status,
        sale_date: saleData.sale_date || new Date().toISOString().split('T')[0],
        payment_method: saleData.payment_method || 'cash',
        cash_paid: cashPaid,
        debit_balance: debitBalance
      };

      console.log('Inserting sale:', saleToInsert);

      // Insert sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert(saleToInsert)
        .select()
        .single();

      if (saleError) {
        console.error('Error inserting sale:', saleError);
        throw saleError;
      }

      console.log('Sale inserted successfully:', sale);

      // Insert sale items
      const saleItems = items.map(item => ({
        ...item,
        sale_id: sale.id
      }));

      console.log('Inserting sale items:', saleItems);

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) {
        console.error('Error inserting sale items:', itemsError);
        throw itemsError;
      }

      console.log('Sale items inserted successfully');

      // Update product stock
      for (const item of items) {
        console.log('Updating stock for product:', item.product_id, 'quantity:', item.quantity);
        
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();

        if (product) {
          const newStock = product.stock - item.quantity;
          console.log('Updating stock from', product.stock, 'to', newStock);
          
          const { error: stockError } = await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.product_id);
          
          if (stockError) {
            console.error('Failed to update stock:', stockError);
          } else {
            console.log('Stock updated successfully for product:', item.product_id);
          }
        }
      }

      // Update customer record with mandatory contact info
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('*')
        .eq('name', saleData.customer_name)
        .single();

      // For credit sales, don't add to total_spent
      const amountToAdd = status === 'Pending' ? 0 : cashPaid;

      const customerData = {
        name: saleData.customer_name,
        email: saleData.customer_email || '',
        phone: saleData.customer_phone || '',
        total_orders: (existingCustomer?.total_orders || 0) + 1,
        total_spent: (existingCustomer?.total_spent || 0) + amountToAdd
      };

      if (existingCustomer) {
        await supabase
          .from('customers')
          .update(customerData)
          .eq('id', existingCustomer.id);
      } else {
        await supabase
          .from('customers')
          .insert(customerData);
      }

      return sale;
    } catch (err) {
      console.error('Error in addSale:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to add sale');
    }
  };

  const deleteSale = async (saleId: string) => {
    try {
      console.log('Deleting sale:', saleId);

      // First, delete all sale items associated with this sale
      const { error: itemsError } = await supabase
        .from('sale_items')
        .delete()
        .eq('sale_id', saleId);

      if (itemsError) {
        console.error('Error deleting sale items:', itemsError);
        throw itemsError;
      }

      // Then delete the sale itself
      const { error: saleError } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleId);

      if (saleError) {
        console.error('Error deleting sale:', saleError);
        throw saleError;
      }

      console.log('Sale deleted successfully');
      
      toast({
        title: "Success",
        description: "Sale deleted successfully",
      });

    } catch (err) {
      console.error('Error in deleteSale:', err);
      toast({
        title: "Error",
        description: "Failed to delete sale",
        variant: "destructive",
      });
      throw new Error(err instanceof Error ? err.message : 'Failed to delete sale');
    }
  };

  return {
    sales,
    loading,
    error,
    addSale,
    deleteSale
  };
};
