import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRealHistory() {
  console.log("Checking history table for real user activity...");
  
  const { data, error } = await supabase
    .from('history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error("Failed to query history:", error.message);
  } else {
    console.log(`Found ${data.length} recent history entries:`);
    data.forEach(entry => {
      console.log(`- [${entry.type}] ${entry.title} (User: ${entry.user_id})`);
    });
    
    if (data.length === 0) {
      console.log("Table is empty. History persistence might not be working or no actions performed yet.");
    }
  }
}

checkRealHistory();
