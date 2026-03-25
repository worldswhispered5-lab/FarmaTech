import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // الاسم التجاري
  scientificName: text("scientific_name"), // الاسم العلمي
  category: text("category").notNull(), // medicine or cosmetic
  origin: text("origin"), // جهة المنشأ
  description: text("description"), // وصف بسيط
  qrSerial: text("qr_serial"), // الباركود أو السيريال نمبر
  benefits: text("benefits"), // الفوائد
  harms: text("harms"), // الأضرار والآثار الجانبية
  interactions: text("interactions"), // التداخلات الدوائية
  medicalAdvice: text("medical_advice"), // نصيحة طبية
});

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey(),
  email: text("email"),
  credits: integer("credits").default(25),
  maxCredits: integer("max_credits").default(25),
  subscriptionTier: text("subscription_tier").default("free"),
  subscriptionExpiresAt: text("subscription_expires_at"),
  stripeCustomerId: text("stripe_customer_id"),
});

export const history = pgTable("history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title"),
  type: text("type"),
  content: text("content"),
  image: text("image"),
  imageHash: text("image_hash"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  planId: text("plan_id").notNull(), // 'starter', 'pro', 'enterprises'
  amount: integer("amount").notNull(), 
  status: text("status").notNull().default("pending"), // 'pending', 'completed', 'failed'
  paymentMethod: text("payment_method"), // 'mastercard', 'visa'
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  expiresAt: text("expires_at"),
});

export const insertProfileSchema = createInsertSchema(profiles);
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertHistorySchema = createInsertSchema(history).omit({
  id: true,
  createdAt: true,
});

export type HistoryEntry = typeof history.$inferSelect;
export type InsertHistoryEntry = z.infer<typeof insertHistorySchema>;

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
