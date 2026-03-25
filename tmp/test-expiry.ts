import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testExpiry() {
  const email = "worldswhispered5@gmail.com";
  
  // Calculate date 2 days from now
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 2);
  
  console.log(`Setting expiry for ${email} to: ${expiryDate.toISOString()}`);

  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      subscription_expires_at: expiryDate.toISOString(),
      subscription_tier: 'pro'
    })
    .eq('email', email)
    .select();

  if (error) {
    console.error("Error updating profile:", error);
  } else {
    console.log("Profile updated successfully:", data);
  }
}

testExpiry();
