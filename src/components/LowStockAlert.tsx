
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LowStockAlertProps {
  products: any[];
}

const LowStockAlert = ({ products }: LowStockAlertProps) => {
  const navigate = useNavigate();
  const lowStockItems = products.filter(product => product.stock <= product.min_stock);

  if (lowStockItems.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-full">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-orange-800">Low Stock Alert</h3>
            <p className="text-sm text-orange-600">
              {lowStockItems.length} product{lowStockItems.length > 1 ? 's are' : ' is'} running low on stock
            </p>
          </div>
        </div>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => navigate('/products')}
          className="flex items-center space-x-1 border-orange-300 text-orange-700 hover:bg-orange-100"
        >
          <Package className="h-3 w-3" />
          <span>View Products</span>
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="mt-3 space-y-2">
        {lowStockItems.slice(0, 3).map((product) => (
          <div key={product.id} className="flex items-center justify-between text-sm">
            <span className="font-medium">{product.name}</span>
            <span className="text-orange-600">
              {product.stock} left (min: {product.min_stock})
            </span>
          </div>
        ))}
        {lowStockItems.length > 3 && (
          <div className="text-sm text-orange-600">
            +{lowStockItems.length - 3} more items
          </div>
        )}
      </div>
    </Card>
  );
};

export default LowStockAlert;
