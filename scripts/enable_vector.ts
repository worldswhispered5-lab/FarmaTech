import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

/**
 * PRODUCTION DATABASE SETUP:
 * This script enables the 'pgvector' extension and creates the necessary
 * RPC functions for similarity search in FarmaTech AI.
 */
async function enableVector() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("--- FarmaTech Database Evolution ---");
  console.log("Step 1: Enabling 'pgvector' extension...");
  
  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: "CREATE EXTENSION IF NOT EXISTS vector;"
    });
    if (error) throw error;
  } catch (err) {
    console.log("SQL RPC not found or failed, focusing on manual setup script instead...");
  }

  // Note: if rpc('exec_sql') is not enabled in your Supabase (it usually isn't by default),
  // the best way is to provide the SQL for the user to run in the SQL Editor.
  
  const setupSQL = `
-- 1. Enable vector extension (Digital Eye)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Ensure the embedding column exists in history table
ALTER TABLE history ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 3. DROP the old function if it exists to avoid signature mismatches
DROP FUNCTION IF EXISTS match_history(vector, float, int);

-- 4. Create the high-performance similarity search function
CREATE OR REPLACE FUNCTION match_history (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id varchar,
  user_id varchar,
  title text,
  type text,
  content text,
  image text,
  image_hash text,
  embedding vector(768),
  created_at text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    history.id,
    history.user_id,
    history.title,
    history.type,
    history.content,
    history.image,
    history.image_hash,
    history.embedding,
    history.created_at,
    1 - (history.embedding <=> query_embedding) AS similarity
  FROM history
  WHERE 1 - (history.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
  `;

  console.log("\n[ACTION REQUIRED]: For security, Supabase doesn't allow remote SQL execution by default.");
  console.log("Please COPY and PASTE the following SQL into your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql):");
  console.log("--------------------------------------------------");
  console.log(setupSQL);
  console.log("--------------------------------------------------");
  console.log("\nOnce you run the SQL in Supabase, tell me 'Done' to proceed to the schema update.");
}

enableVector().catch(console.error);
