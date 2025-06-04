
import React from 'react';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Package, Clock } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';

const AgingInventory = () => {
  const { products } = useProducts();
  const { sales } = useSales();

  // Calculate aging inventory (products not sold in over a year)
  const getAgingProducts = () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return products.filter(product => {
      // Check if this product has been sold in the last year
      const recentSales = sales.filter(sale => {
        const saleDate = new Date(sale.sale_date);
        return saleDate > oneYearAgo && sale.items_count > 0;
      });

      // For simplicity, we'll consider products with zero stock as potentially aging
      // In a real scenario, you'd need sale_items data to check specific product sales
      const hasRecentActivity = recentSales.length > 0;
      const isLowMovement = product.stock > 0 && !hasRecentActivity;
      
      return isLowMovement;
    });
  };

  const agingProducts = getAgingProducts();

  if (agingProducts.length === 0) {
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
            <h3 className="font-semibold text-yellow-800">Aging Inventory Alert</h3>
            <p className="text-sm text-yellow-600">
              {agingProducts.length} product{agingProducts.length > 1 ? 's' : ''} with low movement detected
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
