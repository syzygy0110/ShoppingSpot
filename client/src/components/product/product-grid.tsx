import { ProductCard } from "./product-card";
import { Product } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

export function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  // Calculate sizes for products
  const getProductSize = (index: number) => {
    // Make every third product larger
    if (index % 3 === 0) {
      return "lg:col-span-2 lg:row-span-2";
    }
    return "";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-auto">
      {products.map((product, index) => (
        <div key={product.id} className={`${getProductSize(index)}`}>
          <ProductCard 
            product={product} 
            isLarge={index % 3 === 0}
          />
        </div>
      ))}
    </div>
  );
}