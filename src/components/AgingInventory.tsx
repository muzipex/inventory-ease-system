
import React from 'react';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';

const AgingInventory = () => {
  const { products, loading: productsLoading } = useProducts();
  const { sales, loading: salesLoading } = useSales();

  // Don't render anything while loading
  if (productsLoading || salesLoading) {
    return null;
  }

  // Calculate aging inventory (products with low movement or high stock levels)
  const getAgingProducts = () => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    return products.filter(product => {
      // Consider products with stock greater than 3x minimum stock as potentially aging
      const isHighStock = product.stock > (product.min_stock * 3);
      
      // Consider products that haven't been in recent sales
      const hasRecentSales = sales.some(sale => {
        const saleDate = new Date(sale.sale_date);
        return saleDate > threeMonthsAgo && sale.customer_name && sale.total_amount > 0;
      });

      // Mark as aging if high stock and no recent activity, or stock is very high
      return (isHighStock && !hasRecentSales) || product.stock > 100;
    });
  };

  const agingProducts = getAgingProducts();

  // Only show if there are aging products
  if (!agingProducts || agingProducts.length === 0) {
    return null;
  }

  const totalAgingValue = agingProducts.reduce((sum, product) => 
    sum + (Number(product.price) * product.stock), 0
  );

  return (
    <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-100 rounded-full">
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-semibold text-yellow-800">Aging Stock Alert</h3>
            <p className="text-sm text-yellow-600">
              {agingProducts.length} stock item{agingProducts.length > 1 ? 's' : ''} with low movement detected
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-yellow-800">
            UGX {totalAgingValue.toLocaleString()}
          </div>
          <div className="text-sm text-yellow-600">Total Value</div>
        </div>
      </div>
      
      <div className="mt-3 space-y-2">
        {agingProducts.slice(0, 3).map((product) => (
          <div key={product.id} className="flex items-center justify-between text-sm">
            <span className="font-medium">{product.name}</span>
            <div className="text-right">
              <span className="text-yellow-600">
                {product.stock} units
              </span>
              <div className="text-xs text-yellow-500">
                UGX {(Number(product.price) * product.stock).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
        {agingProducts.length > 3 && (
          <div className="text-sm text-yellow-600">
            +{agingProducts.length - 3} more items
          </div>
        )}
      </div>
    </Card>
  );
};

export default AgingInventory;
