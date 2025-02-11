import { Link } from "wouter";
import { ShoppingCart, MessageSquare, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { state } = useCart();
  const itemCount = state.items.reduce((acc, item) => acc + item.quantity, 0);

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Join cart items with products to get product details
  const cartItemsWithDetails = state.items.map((item) => ({
    ...item,
    product: products?.find((p) => p.id === item.productId),
  }));

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/">
          <span className="font-bold text-xl cursor-pointer">Taobaobao</span>
        </Link>

        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <MessageSquare className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Messages</h4>
                <div className="border-t pt-4">
                  <Link href="/messages">
                    <Button variant="ghost" className="w-full justify-start">
                      View All Messages
                    </Button>
                  </Link>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Shopping Cart</h4>
                {cartItemsWithDetails.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {cartItemsWithDetails.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.product?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                      {cartItemsWithDetails.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          And {cartItemsWithDetails.length - 3} more items...
                        </p>
                      )}
                    </div>
                    <div className="border-t pt-4">
                      <Link href="/cart">
                        <Button className="w-full">View Cart</Button>
                      </Link>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Your cart is empty
                  </p>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/profile">
                <DropdownMenuItem className="cursor-pointer">
                  Profile Settings
                </DropdownMenuItem>
              </Link>
              <Link href="/orders">
                <DropdownMenuItem className="cursor-pointer">
                  My Orders
                </DropdownMenuItem>
              </Link>
              <Link href="/wishlist">
                <DropdownMenuItem className="cursor-pointer">
                  Wishlist
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}