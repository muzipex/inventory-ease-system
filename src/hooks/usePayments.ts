
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePayments = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const recordPayment = async (saleId: string, paymentAmount: number, paymentMethod: string) => {
    setLoading(true);
    try {
      console.log('Recording payment:', { saleId, paymentAmount, paymentMethod });

      // Get current sale data
      const { data: sale, error: fetchError } = await supabase
        .from('sales')
        .select('*')
        .eq('id', saleId)
        .single();

      if (fetchError) {
        console.error('Error fetching sale:', fetchError);
        throw fetchError;
      }

      const currentCashPaid = Number(sale.cash_paid || 0);
      const currentDebitBalance = Number(sale.debit_balance || 0);
      
      const newCashPaid = currentCashPaid + paymentAmount;
      const newDebitBalance = Math.max(0, currentDebitBalance - paymentAmount);
      
      // Determine new status
      let newStatus = sale.status;
      if (newDebitBalance === 0) {
        newStatus = 'Completed';
      } else if (newCashPaid > 0 && newDebitBalance > 0) {
        newStatus = 'Partial Payment';
      }

      console.log('Updating sale with:', {
        cash_paid: newCashPaid,
        debit_balance: newDebitBalance,
        status: newStatus
      });

      // Update the sale record
      const { error: updateError } = await supabase
        .from('sales')
        .update({
          cash_paid: newCashPaid,
          debit_balance: newDebitBalance,
          status: newStatus
        })
        .eq('id', saleId);

      if (updateError) {
        console.error('Error updating sale:', updateError);
        throw updateError;
      }

      // Update customer total_spent for completed payments
      const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('name', sale.customer_name)
        .single();

      if (customer) {
        const updatedTotalSpent = Number(customer.total_spent) + paymentAmount;
        
        await supabase
          .from('customers')
          .update({ total_spent: updatedTotalSpent })
          .eq('id', customer.id);
      }

      console.log('Payment recorded successfully');
      
      toast({
        title: "Payment Recorded",
        description: `Payment of UGX ${paymentAmount.toLocaleString()} recorded successfully`,
      });

      return { success: true };
    } catch (err) {
      console.error('Error recording payment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to record payment';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    recordPayment,
    loading
  };
};
