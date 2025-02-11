import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Price in cents
  image: text("image").notNull(),
  merchantId: integer("merchant_id").notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  fromId: integer("from_id").notNull(),
  toId: integer("to_id").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isMerchant: boolean("is_merchant").notNull().default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isMerchant: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  price: true,
  image: true,
  merchantId: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  userId: true,
  productId: true,
  quantity: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  fromId: true,
  toId: true,
  content: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
