
import React, { useState } from 'react';
import { Search, Filter, Edit, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import ProductModal from '@/components/ProductModal';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/useProducts';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { products, loading, error, addProduct, updateProduct, deleteProduct } = useProducts();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-800';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSaveProduct = async (productData: any) => {
    try {
      console.log('Processing stock save:', productData);
      
      // Validate the data before sending
      if (!productData.name || !productData.sku || !productData.category) {
        throw new Error('Please fill in all required fields');
      }

      if (productData.price < 0 || productData.stock < 0 || productData.minStock < 0) {
        throw new Error('Price, stock, and minimum stock must be positive numbers');
      }

      // Prepare the data for database insertion/update
      const dbProductData = {
        name: productData.name.trim(),
        sku: productData.sku.trim(),
        category: productData.category.trim(),
        price: Number(productData.price),
        stock: Number(productData.stock),
        min_stock: Number(productData.minStock),
        status: productData.status
      };

      console.log('Sending to database:', dbProductData);

      if (productData.id) {
        // Update existing stock item
        await updateProduct(productData.id, dbProductData);
        toast({
          title: "Stock Updated",
          description: `${productData.name} has been updated successfully`,
        });
      } else {
        // Add new stock item
        await addProduct(dbProductData);
        toast({
          title: "Stock Added",
          description: `${productData.name} has been added successfully with ${productData.stock} units in stock`,
        });
      }
    } catch (err) {
      console.error('Error saving stock:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save stock item. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const product = products.find(p => p.id === productId);
      await deleteProduct(productId);
      toast({
        title: "Stock Deleted",
        description: `${product?.name} has been deleted successfully`,
      });
    } catch (err) {
      console.error('Error deleting stock:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete stock item",
        variant: "destructive"
      });
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading stock...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
        <ProductModal onSave={handleSaveProduct} />
      </div>

      {/* Search and Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search stock by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
        </div>
      </Card>

      {/* Stock Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    UGX {Number(product.price).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.stock.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <ProductModal 
                        product={{
                          id: product.id,
                          name: product.name,
                          sku: product.sku,
                          category: product.category,
                          price: Number(product.price),
                          stock: product.stock,
                          minStock: product.min_stock,
                          status: product.status
                        }} 
                        onSave={handleSaveProduct}
                        trigger={
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No stock found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search terms or add a new stock item.
          </p>
        </div>
      )}
    </div>
  );
};

export default Products;
