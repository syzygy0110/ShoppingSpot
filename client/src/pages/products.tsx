import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { ProductGrid } from "@/components/product/product-grid";

export default function Products() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Featured Products</h1>
      <ProductGrid products={products || []} isLoading={isLoading} />
    </div>
  );
}
