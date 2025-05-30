
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
        const { data, error } = await supabase
          .from('sales')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSales(data || []);
      } catch (err) {
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
  }, items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>) => {
    try {
      // Insert sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert(saleData)
        .select()
        .single();

      if (saleError) throw saleError;

      // Insert sale items
      const saleItems = items.map(item => ({
        ...item,
        sale_id: sale.id
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Update product stock
      for (const item of items) {
        const { error: stockError } = await supabase.rpc(
          'update_product_stock',
          {
            product_id: item.product_id,
            quantity_sold: item.quantity
          }
        );
        if (stockError) console.error('Failed to update stock:', stockError);
      }

      return sale;
    } catch (err) {
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
