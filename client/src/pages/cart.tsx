import { useQuery } from "@tanstack/react-query";
import { CartItem, Product } from "@shared/schema";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Minus, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Cart() {
  const { state, dispatch } = useCart();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-24 w-24" />
              <div className="flex-1">
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const cartItemsWithDetails = state.items.map((item) => ({
    ...item,
    product: products?.find((p) => p.id === item.productId),
  }));

  const total = cartItemsWithDetails.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.quantity,
    0
  );

  const updateQuantity = async (id: number, quantity: number) => {
    if (quantity < 1) return;
    try {
      setIsUpdating(true);
      await apiRequest("PATCH", `/api/cart/${id}`, { quantity });
      dispatch({ type: "UPDATE_QUANTITY", id, quantity });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update quantity",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItem = async (id: number) => {
    try {
      setIsUpdating(true);
      await apiRequest("DELETE", `/api/cart/${id}`);
      dispatch({ type: "REMOVE_ITEM", id });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not remove item",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      {cartItemsWithDetails.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItemsWithDetails.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <img
                    src={item.product?.image}
                    alt={item.product?.name}
                    className="h-24 w-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      ${((item.product?.price || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={isUpdating}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={isUpdating}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      disabled={isUpdating}
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${(total / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t pt-2 mt-4">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${(total / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-6">
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Button asChild>
              <a href="/">Continue Shopping</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
