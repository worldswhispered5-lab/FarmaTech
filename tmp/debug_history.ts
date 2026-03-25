import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugHistory() {
  console.log("Checking history table content...");
  
  const { data, count, error } = await supabase
    .from('history')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching history:", error.message);
    return;
  }

  console.log(`Total history entries: ${count}`);
  if (data && data.length > 0) {
    console.log("Last 5 entries:");
    data.forEach(entry => {
      console.log(`- ID: ${entry.id}, User: ${entry.user_id}, Title: ${entry.title}, Created: ${entry.created_at}`);
    });
  } else {
    console.log("No history entries found in the table.");
  }
}

debugHistory();
