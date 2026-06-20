// File: ogs-client/depot/src/components/inventory/ProductDialog.jsx
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addStockLog } from "@/data/stockHistoryData";

const ProductDialog = ({ open, onOpenChange, product, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    price: "",
    stock: "",
  });
  

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        barcode: product.barcode,
        price: product.price,
        stock: product.stock || 0,
      });
    } else if (open) {
        // Reset for new product and generate barcode
        const randomCode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
        setFormData({
            name: "",
            barcode: randomCode,
            price: "",
            stock: "",
        });
    }
  }, [product, open]);





  const handleSubmit = (e) => {
    e.preventDefault();
    const newStock = parseInt(formData.stock);
    const oldStock = product ? parseInt(product.stock) : 0;

    // Log stock change if it's an edit and stock differs
    if (product && newStock !== oldStock) {
      addStockLog({
        productName: product.name,
        productBarcode: product.barcode,
        previousStock: oldStock,
        currentStock: newStock,
        change: newStock - oldStock,
      });
    }

    onSave({
        ...product, // Keep ID if editing
        ...formData,
        price: parseFloat(formData.price),
        stock: newStock
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25 bg-card border-border shadow-2xl text-foreground">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-foreground">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary"
              placeholder="e.g. Blue Pen"
              required
            />
          </div>
          
          <div className="grid gap-2">
              <Label htmlFor="barcode" className="text-foreground">Barcode (Auto-generated)</Label>
              <div className="flex gap-2">
                  <Input
                      id="barcode"
                      value={formData.barcode}
                      readOnly
                      className="bg-muted/30 border-border text-muted-foreground cursor-not-allowed flex-1"
                      placeholder="Auto-generated ID"
                  />
              </div>
          </div>



          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="price" className="text-foreground">Price (PKR)</Label>
                <Input
                id="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary"
                placeholder="0.00"
                required
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="stock" className="text-foreground">Stock Qty</Label>
                <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary"
                placeholder="0"
                required
                />
            </div>
          </div>


          <DialogFooter className="mt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-muted-foreground hover:bg-muted">
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-white hover:bg-primary/90 shadow-sm transition-all focus-visible:ring-primary">
              {product ? "Save Changes" : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
