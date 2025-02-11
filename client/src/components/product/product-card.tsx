import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@shared/schema";
import { useCart } from "@/lib/cart";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface ProductCardProps {
  product: Product;
  isLarge?: boolean;
}

export function ProductCard({ product, isLarge }: ProductCardProps) {
  const { dispatch } = useCart();
  const { toast } = useToast();

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the Add to Cart button
    try {
      const res = await apiRequest("POST", "/api/cart", {
        productId: product.id,
        userId: 1, // TODO: Get from auth
        quantity: 1,
      });
      const item = await res.json();
      dispatch({ type: "ADD_ITEM", item });
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not add item to cart.",
        variant: "destructive",
      });
    }
  };

  return (
    <Link href={`/products/${product.id}`}>
      <a className="block h-full">
        <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
          <img
            src={product.image}
            alt={product.name}
            className={`w-full object-cover ${isLarge ? 'h-96' : 'h-48'}`}
          />
          <CardContent className="p-4">
            <h3 className={`font-semibold ${isLarge ? 'text-2xl' : 'text-lg'}`}>
              {product.name}
            </h3>
            <p className={`text-muted-foreground mt-1 ${isLarge ? 'text-lg' : 'text-sm'}`}>
              ${(product.price / 100).toFixed(2)}
            </p>
            <p className={`mt-2 line-clamp-2 ${isLarge ? 'text-base' : 'text-sm'}`}>
              {product.description}
            </p>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button onClick={addToCart} className="w-full">
              Add to Cart
            </Button>
          </CardFooter>
        </Card>
      </a>
    </Link>
  );
}