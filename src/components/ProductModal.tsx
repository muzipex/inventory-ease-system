
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Plus, Edit } from 'lucide-react';

interface Product {
  id?: string | number;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  status: string;
}

interface ProductModalProps {
  product?: Product;
  onSave: (product: Product) => void;
  trigger?: React.ReactNode;
}

const ProductModal = ({ product, onSave, trigger }: ProductModalProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Product>({
    name: product?.name || '',
    sku: product?.sku || '',
    category: product?.category || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
    minStock: product?.minStock || 10,
    status: product?.status || 'In Stock',
    ...product
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate status based on stock levels
    let calculatedStatus = 'In Stock';
    if (formData.stock === 0) {
      calculatedStatus = 'Out of Stock';
    } else if (formData.stock <= formData.minStock) {
      calculatedStatus = 'Low Stock';
    }
    
    // Prepare the product data with calculated status
    const productToSave = {
      ...formData,
      status: calculatedStatus,
      // Ensure numeric values are properly converted
      price: Number(formData.price),
      stock: Number(formData.stock),
      minStock: Number(formData.minStock)
    };
    
    console.log('Submitting product:', productToSave);
    onSave(productToSave);
    setOpen(false);
  };

  const handleInputChange = (field: keyof Product, value: string | number) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: field === 'price' || field === 'stock' || field === 'minStock' 
        ? Number(value) || 0 
        : value 
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => handleInputChange('sku', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="price">Price (UGX)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="stock">Current Stock</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              max="999999"
              value={formData.stock}
              onChange={(e) => handleInputChange('stock', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="minStock">Minimum Stock</Label>
            <Input
              id="minStock"
              type="number"
              min="0"
              max="999999"
              value={formData.minStock}
              onChange={(e) => handleInputChange('minStock', e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {product ? 'Update' : 'Add'} Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
