import {
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type Message,
  type InsertMessage,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Cart
  getCartItems(userId: number): Promise<CartItem[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<void>;
  
  // Messages
  getMessages(userId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private messages: Map<number, Message>;
  private currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.messages = new Map();
    this.currentId = { users: 1, products: 1, cartItems: 1, messages: 1 };

    // Add sample products with rich content
    const sampleProducts: InsertProduct[] = [
      {
        name: "Premium Leather Watch",
        description: "Handcrafted luxury timepiece featuring genuine Italian leather straps, Swiss movement, and sapphire crystal face. Water-resistant up to 100m with a stunning brushed steel finish. Perfect for both formal occasions and daily wear.",
        price: 29999,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
        merchantId: 1,
      },
      {
        name: "Wireless Noise-Canceling Headphones",
        description: "Premium wireless headphones with active noise cancellation, 40-hour battery life, and premium audio drivers. Features touch controls, voice assistant support, and premium memory foam ear cushions for ultimate comfort.",
        price: 19999,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        merchantId: 1,
      },
      {
        name: "Professional Camera DSLR Kit",
        description: "Professional-grade DSLR camera with 24.2MP sensor, 4K video capability, and advanced autofocus system. Includes 18-55mm lens, camera bag, and SD card. Perfect for both photography enthusiasts and professionals.",
        price: 129999,
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
        merchantId: 2,
      },
      {
        name: "Smart Fitness Tracker",
        description: "Advanced fitness tracking device with heart rate monitoring, sleep analysis, and GPS. Features a vibrant OLED display, 7-day battery life, and water resistance up to 50m. Syncs with all major fitness apps.",
        price: 9999,
        image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6",
        merchantId: 2,
      },
      {
        name: "Ergonomic Gaming Chair",
        description: "Premium gaming chair with adjustable lumbar support, 4D armrests, and premium PU leather. Features a robust steel frame, smooth-rolling casters, and supports up to 300 lbs. Perfect for long gaming sessions.",
        price: 24999,
        image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6",
        merchantId: 3,
      },
      {
        name: "Mechanical Gaming Keyboard",
        description: "Professional mechanical keyboard with RGB backlighting, N-key rollover, and premium Cherry MX switches. Features dedicated macro keys, multimedia controls, and a detachable wrist rest.",
        price: 14999,
        image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae",
        merchantId: 3,
      },
      {
        name: "4K Ultra HD Smart TV",
        description: "55-inch 4K Smart TV with QLED display, HDR support, and 120Hz refresh rate. Features built-in streaming apps, voice control, and HDMI 2.1 ports for next-gen gaming consoles.",
        price: 89999,
        image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1",
        merchantId: 1,
      },
      {
        name: "Premium Coffee Maker",
        description: "Professional-grade coffee maker with 10-cup capacity, programmable brewing, and built-in grinder. Features temperature control, multiple brew strengths, and a thermal carafe to keep coffee hot for hours.",
        price: 19999,
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
        merchantId: 2,
      }
    ];

    sampleProducts.forEach(product => this.createProduct(product));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentId.products++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  // Cart methods
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId,
    );
  }

  async addToCart(insertItem: InsertCartItem): Promise<CartItem> {
    const id = this.currentId.cartItems++;
    const item: CartItem = { ...insertItem, id };
    this.cartItems.set(id, item);
    return item;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (item) {
      const updated = { ...item, quantity };
      this.cartItems.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async removeFromCart(id: number): Promise<void> {
    this.cartItems.delete(id);
  }

  // Message methods
  async getMessages(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (msg) => msg.fromId === userId || msg.toId === userId,
    );
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentId.messages++;
    const message: Message = { 
      ...insertMessage, 
      id,
      timestamp: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();