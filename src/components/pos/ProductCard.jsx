// File: ogs-client/depot/src/components/pos/ProductCard.jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProductCard = ({ product, addToCart }) => {
  return (
    <Card
      className="overflow-hidden cursor-pointer group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-border/50 bg-card/80 hover:bg-card active:scale-[0.98]"
      onClick={() => addToCart(product)}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-white/80 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
            Click to add
          </span>
        </div>
      </div>
      <CardHeader className="p-3 pb-1">
        <CardTitle className="text-sm font-medium leading-tight line-clamp-2">
          {product.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <p className="text-lg font-bold text-primary">Rs. {product.price}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
          {product.category}
        </p>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
