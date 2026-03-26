import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function wipeHistory() {
  console.log("Starting global history wipe...");
  
  // Use a filter that matches all UUIDs by checking for non-null IDs
  const { data, error, count } = await supabase
    .from("history")
    .delete()
    .not("id", "is", null);

  if (error) {
    console.error("Error wiping history:", error);
    process.exit(1);
  }

  console.log(`Successfully deleted history records.`);
}

wipeHistory().catch(console.error);
