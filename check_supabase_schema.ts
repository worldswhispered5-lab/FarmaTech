
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase
    .from('history')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('Error fetching history:', error);
  } else {
    console.log('Columns in history table:', Object.keys(data[0] || {}));
  }
}

checkSchema();
