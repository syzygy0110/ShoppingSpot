import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Minus, Trash2 } from "lucide-react";

interface CartSheetProps {
  open: boolean;
  onClose: () => void;
}

export function CartSheet({ open, onClose }: CartSheetProps) {
  const { state, dispatch } = useCart();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateQuantity = async (id: number, quantity: number) => {
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

  const total = state.items.reduce((acc, item) => acc + item.quantity * item.price, 0);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>
        
        <div className="mt-8 space-y-4">
          {state.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <img
                src={item.image}
                alt={item.name}
                className="h-16 w-16 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-muted-foreground">
                  ${(item.price / 100).toFixed(2)}
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
            </div>
          ))}
        </div>

        {state.items.length > 0 ? (
          <div className="mt-8">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${(total / 100).toFixed(2)}</span>
            </div>
            <Button className="w-full mt-4">Checkout</Button>
          </div>
        ) : (
          <div className="mt-8 text-center text-muted-foreground">
            Your cart is empty
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
