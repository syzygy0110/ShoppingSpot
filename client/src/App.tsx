import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/lib/cart";
import { Navbar } from "@/components/layout/navbar";
import NotFound from "@/pages/not-found";
import Products from "@/pages/products";
import ProductDetails from "@/pages/product-details";
import Cart from "@/pages/cart";
import Messages from "@/pages/messages";
import Profile from "@/pages/profile";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Products} />
          <Route path="/products/:id" component={ProductDetails} />
          <Route path="/cart" component={Cart} />
          <Route path="/messages" component={Messages} />
          <Route path="/profile" component={Profile} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Router />
        <Toaster />
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;