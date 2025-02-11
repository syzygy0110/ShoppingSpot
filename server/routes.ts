import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer, WebSocket } from "ws";
import {
  insertProductSchema,
  insertCartItemSchema,
  insertMessageSchema
} from "@shared/schema";

interface ReviewMessage {
  type: "review";
  productId: number;
  data: {
    userId: number;
    username: string;
    rating: number;
    comment: string;
  };
}

interface SubscribeMessage {
  type: "subscribe_reviews";
  productId: number;
}

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store active connections and their subscriptions
  const clients = new Map<number, WebSocket>();
  const productSubscriptions = new Map<number, Set<WebSocket>>();

  wss.on('connection', (ws) => {
    let userId: number | undefined;

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === "auth") {
          userId = message.userId;
          clients.set(userId, ws);
        } else if (message.type === "subscribe_reviews") {
          const productId = message.productId;
          if (!productSubscriptions.has(productId)) {
            productSubscriptions.set(productId, new Set());
          }
          productSubscriptions.get(productId)?.add(ws);
        } else if (message.type === "review") {
          const { productId, data } = message as ReviewMessage;
          const reviewData = {
            ...data,
            id: Math.floor(Math.random() * 10000), // TODO: Use proper ID generation
            createdAt: new Date().toISOString(),
          };

          // Broadcast the review to all subscribed clients
          const subscribers = productSubscriptions.get(productId);
          if (subscribers) {
            const reviewMessage = JSON.stringify({
              type: "review",
              data: reviewData,
            });
            subscribers.forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(reviewMessage);
              }
            });
          }
        } else if (message.type === 'message') {
          const validatedMessage = insertMessageSchema.parse(message.data);
          const savedMessage = await storage.createMessage(validatedMessage);

          // Send to recipient if online
          const recipientWs = clients.get(validatedMessage.toId);
          if (recipientWs?.readyState === WebSocket.OPEN) {
            recipientWs.send(JSON.stringify(savedMessage));
          }
        }
      } catch (error) {
        console.error('WebSocket error:', error);
      }
    });

    ws.on('close', () => {
      // Remove client from all subscriptions when they disconnect
      productSubscriptions.forEach(subscribers => {
        subscribers.delete(ws);
      });
      if (userId) {
        clients.delete(userId);
      }
    });
  });

  // REST API routes
  app.get("/api/products", async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get("/api/products/:id", async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.json(product);
  });

  app.get("/api/cart/:userId", async (req, res) => {
    const items = await storage.getCartItems(Number(req.params.userId));
    res.json(items);
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const cartItem = insertCartItemSchema.parse(req.body);
      const item = await storage.addToCart(cartItem);
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid cart item data" });
    }
  });

  app.patch("/api/cart/:id", async (req, res) => {
    const updated = await storage.updateCartItem(
      Number(req.params.id),
      req.body.quantity
    );
    if (!updated) {
      res.status(404).json({ message: "Cart item not found" });
      return;
    }
    res.json(updated);
  });

  app.delete("/api/cart/:id", async (req, res) => {
    await storage.removeFromCart(Number(req.params.id));
    res.status(204).end();
  });

  app.get("/api/messages/:userId", async (req, res) => {
    const messages = await storage.getMessages(Number(req.params.userId));
    res.json(messages);
  });

  return httpServer;
}