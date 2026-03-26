import "dotenv/config";
import { type User, type InsertUser, type Product, type InsertProduct, type Profile, type HistoryEntry, type InsertHistoryEntry, type Subscription, type InsertSubscription } from "@shared/schema";
import { createClient } from "@supabase/supabase-js";

// Database Configuration
const supabaseUrl = process.env['VITE_SUPABASE_URL'];
const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY'] || process.env['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error("[FarmaTech] CRITICAL: SUPABASE_URL or SUPABASE_KEY is missing from environment!");
} else {
  console.log("[FarmaTech] Supabase initialized. Key type:", process.env['SUPABASE_SERVICE_ROLE_KEY'] ? "SERVICE_ROLE" : "ANON");
}

const supabase = createClient(supabaseUrl || "", supabaseKey || "");

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  // Product Methods
  getProducts(): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Profile Methods
  getProfile(id: string): Promise<Profile | undefined>;
  updateProfile(id: string, updates: Partial<Profile>): Promise<Profile>;

  // History Methods
  getHistory(userId: string): Promise<HistoryEntry[]>;
  getHistoryByHash(userId: string, hash: string): Promise<HistoryEntry | undefined>;
  getGlobalHistoryByHash(hash: string): Promise<HistoryEntry | undefined>;
  cleanupOldHistory(userId: string): Promise<void>;
  createHistory(entry: InsertHistoryEntry & { userId: string }): Promise<HistoryEntry>;
  updateHistory(id: string, updates: Partial<InsertHistoryEntry>): Promise<HistoryEntry>;

  // Subscription Methods
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getSubscriptions(userId: string): Promise<Subscription[]>;
}

export class SupabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const { data } = await supabase.from('users').select().eq('id', id).single();
    return data || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data } = await supabase.from('users').select().eq('username', username).single();
    return data || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await supabase.from('users').insert(insertUser).select().single();
    if (error) throw error;
    return data;
  }

  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase.from('products').select().limit(100);
    if (error) throw error;
    return data || [];
  }

  async searchProducts(query: string): Promise<Product[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    const isBarcode = /^[0-9A-Z]{5,}$/i.test(cleanQuery);
    
    if (isBarcode) {
      const { data, error } = await supabase
        .from('products')
        .select()
        .eq('qr_serial', cleanQuery);
      if (!error && data && data.length > 0) return data;
    }

    // Normalizing the query for better matching (removing common separators)
    const normalized = cleanQuery.replace(/[- ]/g, '');
    
    // Text search fallback (search by name or scientific name)
    // We try to match the exact query or a version with wildcards
    const { data, error } = await supabase
      .from('products')
      .select()
      .or(`name.ilike.%${cleanQuery}%,scientific_name.ilike.%${cleanQuery}%,name.ilike.%${normalized}%,scientific_name.ilike.%${normalized}%`);
    
    if (error) {
      console.error("[Storage Error] Supabase search failed:", error);
      return [];
    }
    return data || [];
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const { data, error } = await supabase.from('products').insert(insertProduct).select().single();
    if (error) throw error;
    return data;
  }

  async getProfile(id: string): Promise<Profile | undefined> {
    const { data, error } = await supabase.from('profiles').select().eq('id', id).maybeSingle();
    if (error) throw error;
    if (!data) return undefined;

    // Map snake_case from DB back to camelCase for the frontend
    return {
      id: data.id,
      email: data.email,
      credits: data.credits,
      maxCredits: data.max_credits, // Map snake_case to camelCase
      subscriptionTier: data.subscription_tier,
      subscriptionExpiresAt: data.subscription_expires_at,
      stripeCustomerId: data.stripe_customer_id,
    };
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
    const { data: existing } = await supabase.from('profiles').select().eq('id', id).single();
    
    // Convert camelCase to snake_case for raw Supabase client
    const dbUpdates: any = {};
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.credits !== undefined) dbUpdates.credits = updates.credits;
    if (updates.maxCredits !== undefined) dbUpdates.max_credits = updates.maxCredits; 
    if (updates.subscriptionTier !== undefined) dbUpdates.subscription_tier = updates.subscriptionTier;
    if (updates.subscriptionExpiresAt !== undefined) dbUpdates.subscription_expires_at = updates.subscriptionExpiresAt;
    if (updates.stripeCustomerId !== undefined) dbUpdates.stripe_customer_id = updates.stripeCustomerId;

    if (existing) {
      const { data, error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return {
        id: data.id,
        email: data.email,
        credits: data.credits,
        maxCredits: data.max_credits,
        subscriptionTier: data.subscription_tier,
        subscriptionExpiresAt: data.subscription_expires_at,
        stripeCustomerId: data.stripe_customer_id,
      };
    } else {
      // Create new profile with the updates
      const { data, error } = await supabase
        .from('profiles')
        .insert({ 
          id, 
          ...dbUpdates, 
          credits: dbUpdates.credits ?? 10,
          max_credits: updates.maxCredits ?? 10 
        })
        .select('*')
        .single();
      if (error) throw error;
      return {
        id: data.id,
        email: data.email,
        credits: data.credits,
        maxCredits: data.max_credits,
        subscriptionTier: data.subscription_tier,
        subscriptionExpiresAt: data.subscription_expires_at,
        stripeCustomerId: data.stripe_customer_id,
      };
    }
  }

  async getHistory(userId: string): Promise<HistoryEntry[]> {
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("[Storage Error] getHistory failed:", error);
      return [];
    }
    
    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      title: item.title,
      type: item.type,
      content: item.content,
      image: item.image,
      imageHash: item.image_hash,
      createdAt: item.created_at
    }));
  }

  async getHistoryByHash(userId: string, hash: string): Promise<HistoryEntry | undefined> {
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', userId)
      .eq('image_hash', hash)
      .maybeSingle();
    
    if (error || !data) return undefined;
    
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      type: data.type,
      content: data.content,
      image: data.image,
      imageHash: data.image_hash,
      createdAt: data.created_at
    };
  }

  async getGlobalHistoryByHash(hash: string): Promise<HistoryEntry | undefined> {
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .eq('image_hash', hash)
      .limit(1)
      .maybeSingle();
    
    if (error || !data) return undefined;
    
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      type: data.type,
      content: data.content,
      image: data.image,
      imageHash: data.image_hash,
      createdAt: data.created_at
    };
  }

  async cleanupOldHistory(userId: string): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const isoString = thirtyDaysAgo.toISOString();

    const { error } = await supabase
      .from('history')
      .delete()
      .eq('user_id', userId)
      .lt('created_at', isoString);
    
    if (error) {
      console.error("[Storage Error] cleanupOldHistory failed:", error);
    }
  }

  async createHistory(entry: InsertHistoryEntry & { userId: string }): Promise<HistoryEntry> {
    const { data, error } = await supabase
      .from('history')
      .insert({
        user_id: entry.userId,
        title: entry.title,
        type: entry.type,
        content: entry.content,
        image: entry.image,
        image_hash: entry.imageHash,
      })
      .select('*')
      .single();
    
    if (error) {
      console.error("[Storage Error] createHistory failed:", error);
      throw error;
    }
    
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      type: data.type,
      content: data.content,
      image: data.image,
      imageHash: data.image_hash,
      createdAt: data.created_at
    };
  }

  async updateHistory(id: string, updates: Partial<InsertHistoryEntry>): Promise<HistoryEntry> {
    const { data, error } = await supabase
      .from('history')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) {
      console.error("[Storage Error] updateHistory failed:", error);
      throw error;
    }
    
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      type: data.type,
      content: data.content,
      image: data.image,
      imageHash: data.image_hash,
      createdAt: data.created_at
    };
  }

  async createSubscription(sub: InsertSubscription): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: sub.userId,
        plan_id: sub.planId,
        amount: sub.amount,
        status: sub.status,
        payment_method: sub.paymentMethod,
        expires_at: sub.expiresAt
      })
      .select('*')
      .single();
    
    if (error) {
      console.error("[Storage Error] createSubscription failed:", error);
      throw error;
    }
    
    return {
      id: data.id,
      userId: data.user_id,
      planId: data.plan_id,
      amount: data.amount,
      status: data.status,
      paymentMethod: data.payment_method,
      createdAt: data.created_at,
      expiresAt: data.expires_at,
    };
  }

  async getSubscriptions(userId: string): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("[Storage Error] getSubscriptions failed:", error);
      return [];
    }
    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      planId: item.plan_id,
      amount: item.amount,
      status: item.status,
      paymentMethod: item.payment_method,
      createdAt: item.created_at,
      expiresAt: item.expires_at,
    }));
  }
}

export const storage = new SupabaseStorage();
