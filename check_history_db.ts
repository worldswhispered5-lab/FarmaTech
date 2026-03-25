import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log("Ensuring history table exists...");
  
  // Since we can't easily run arbitrary SQL without a specific RPC,
  // we'll try to insert a dummy record or just assume the user will 
  // run the SQL in the Supabase dashboard.
  // HOWEVER, I will try to use the 'query' if I can find an RPC name.
  
  console.log("Please run the following SQL in your Supabase SQL Editor:");
  console.log(`
      CREATE TABLE IF NOT EXISTS history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        title TEXT,
        type TEXT,
        content TEXT,
        image TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_history_user_id ON history(user_id);
  `);

  // Try a ping to check connection
  const { data, error } = await supabase.from('history').select('id').limit(1);
  if (error && error.code === '42P01') {
    console.error("Table 'history' does not exist yet. Please create it using the SQL provided above.");
  } else if (error) {
    console.error("Database connection error:", error.message);
  } else {
    console.log("Table 'history' confirmed to exist.");
  }
}

migrate();
