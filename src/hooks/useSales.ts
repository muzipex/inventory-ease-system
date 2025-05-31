
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Sale = Database['public']['Tables']['sales']['Row'];
type SaleItem = Database['public']['Tables']['sale_items']['Row'];

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
        console.log('Sales fetched successfully:', data?.length || 0, 'records');
        setSales(data || []);
      } catch (err) {
        console.error('Failed to fetch sales:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
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
      supabase.removeChannel(channel);
    };
  }, []);

  const addSale = async (saleData: {
    order_id: string;
    customer_name: string;
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
      
      // Prepare sale data for insertion
      const saleToInsert = {
        order_id: saleData.order_id,
        customer_name: saleData.customer_name,
        total_amount: saleData.total_amount,
        items_count: saleData.items_count,
        status: saleData.status || 'Completed',
        sale_date: saleData.sale_date || new Date().toISOString().split('T')[0],
        payment_method: saleData.payment_method || 'cash'
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

      // Update customer record if partial payment
      if (saleData.cash_paid !== undefined && saleData.debit_balance !== undefined && saleData.debit_balance > 0) {
        console.log('Updating customer with partial payment data');
        
        // Check if customer exists
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('*')
          .eq('name', saleData.customer_name)
          .single();

        const customerData = {
          name: saleData.customer_name,
          total_orders: (existingCustomer?.total_orders || 0) + 1,
          total_spent: (existingCustomer?.total_spent || 0) + saleData.cash_paid
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
      } else {
        // Update customer record normally
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('*')
          .eq('name', saleData.customer_name)
          .single();

        const customerData = {
          name: saleData.customer_name,
          total_orders: (existingCustomer?.total_orders || 0) + 1,
          total_spent: (existingCustomer?.total_spent || 0) + saleData.total_amount
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
      }

      return sale;
    } catch (err) {
      console.error('Error in addSale:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to add sale');
    }
  };

  return {
    sales,
    loading,
    error,
    addSale
  };
};
