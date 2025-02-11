import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, ShoppingCart, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChatWindow } from "@/components/chat/chat-window";
import { useState, useEffect, useRef } from "react";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Review {
  id: number;
  userId: number;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewMessage {
  type: "review";
  data: Review;
}

const mockReviews: Review[] = [
  {
    id: 1,
    userId: 1,
    username: "John Doe",
    rating: 5,
    comment: "Excellent product! The quality is outstanding and it arrived quickly.",
    createdAt: "2024-02-10T10:00:00Z",
  },
  {
    id: 2,
    userId: 2,
    username: "Jane Smith",
    rating: 4,
    comment: "Very good product, but the delivery took a bit longer than expected.",
    createdAt: "2024-02-09T15:30:00Z",
  },
];

const mockProductImages = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=60",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=40",
];

export default function ProductDetails() {
  const { id } = useParams();
  const { dispatch } = useCart();
  const { toast } = useToast();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const socketRef = useRef<WebSocket>();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
  });

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "subscribe_reviews", productId: id }));
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "review") {
        setReviews((prev) => [...prev, message.data]);
      }
    };

    socketRef.current = socket;
    return () => socket.close();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse">
          <div className="h-8 w-1/3 bg-muted rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-6 w-3/4 bg-muted rounded"></div>
              <div className="h-4 w-1/2 bg-muted rounded"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted rounded"></div>
                <div className="h-4 w-full bg-muted rounded"></div>
                <div className="h-4 w-3/4 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  const addToCart = async () => {
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

  const submitReview = () => {
    if (!newReview.trim()) return;

    const review: Omit<Review, "id" | "createdAt"> = {
      userId: 1, // TODO: Get from auth
      username: "Current User", // TODO: Get from auth
      rating: newRating,
      comment: newReview,
    };

    socketRef.current?.send(JSON.stringify({
      type: "review",
      productId: id,
      data: review,
    }));

    setNewReview("");
    toast({
      title: "Review Submitted",
      description: "Thank you for your feedback!",
    });
  };

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <img
            src={mockProductImages[selectedImage]}
            alt={product.name}
            className="w-full aspect-square object-cover rounded-lg shadow-lg"
          />
          <div className="grid grid-cols-4 gap-2">
            {mockProductImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedImage === i ? "border-primary" : "border-transparent"
                }`}
              >
                <img
                  src={img}
                  alt={`Product view ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-primary text-primary"
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                (128 reviews)
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-3xl font-semibold">
              ${(product.price / 100).toFixed(2)}
            </p>

            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={addToCart}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>

              <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="lg">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chat with Seller
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>Chat with Seller</DialogTitle>
                  </DialogHeader>
                  <ChatWindow userId={1} merchantId={product.merchantId} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Product Description</h2>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <li>Premium Quality Materials</li>
                <li>Advanced Technology</li>
                <li>Ergonomic Design</li>
                <li>1 Year Warranty</li>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Brand</span>
                  <span className="font-medium">Premium Tech</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Model</span>
                  <span className="font-medium">2024 Edition</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">In Stock</span>
                  <span className="font-medium">Yes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

        {/* Add Review */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Rating:</span>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setNewRating(i + 1)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          i < newRating
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                placeholder="Share your thoughts about this product..."
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                className="min-h-[100px]"
              />
              <Button onClick={submitReview}>Submit Review</Button>
            </div>
          </CardContent>
        </Card>

        {/* Review List */}
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {review.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{review.username}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(review.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}