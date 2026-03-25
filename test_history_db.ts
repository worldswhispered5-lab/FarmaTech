import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testHistory() {
  console.log("Testing history persistence...");
  
  const testEntry = {
    user_id: "test-user-id",
    title: "اختبار السجل",
    type: "medicine",
    content: "هذا اختبار للتأكد من حفظ السجل بنجاح.",
  };

  const { data, error } = await supabase
    .from('history')
    .insert(testEntry)
    .select('*')
    .single();

  if (error) {
    console.error("History insertion failed:", error.message);
  } else {
    console.log("History entry created successfully:", data.id);
    
    // Cleanup
    await supabase.from('history').delete().eq('id', data.id);
    console.log("Test entry cleaned up.");
  }
}

testHistory();
