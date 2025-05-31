
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial fetch
    const fetchProducts = async () => {
      try {
        console.log('Fetching initial products...');
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching products:', error);
          throw error;
        }
        
        console.log('Initial products fetched:', data?.length || 0);
        setProducts(data || []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Set up real-time subscription
    console.log('Setting up real-time subscription for products...');
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Product change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            console.log('Adding new product:', payload.new);
            setProducts(prev => [payload.new as Product, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            console.log('Updating product:', payload.new);
            setProducts(prev => 
              prev.map(product => 
                product.id === payload.new.id ? payload.new as Product : product
              )
            );
          } else if (payload.eventType === 'DELETE') {
            console.log('Deleting product:', payload.old);
            setProducts(prev => 
              prev.filter(product => product.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up products subscription...');
      supabase.removeChannel(channel);
    };
  }, []);

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Adding new product:', productData);
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) {
        console.error('Error adding product:', error);
        throw error;
      }
      
      console.log('Product added successfully:', data);
      return data;
    } catch (err) {
      console.error('Failed to add product:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to add product');
    }
  };

  const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      console.log('Updating product:', id, updates);
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }
      
      console.log('Product updated successfully:', data);
      return data;
    } catch (err) {
      console.error('Failed to update product:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to update product');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      console.log('Deleting product:', id);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        throw error;
      }
      
      console.log('Product deleted successfully');
    } catch (err) {
      console.error('Failed to delete product:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct
  };
};
