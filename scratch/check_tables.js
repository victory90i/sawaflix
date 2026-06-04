const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local to be safe
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.join('=').trim().replace(/^"|"$/g, '');
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing credentials');
  console.log('Keys found:', Object.keys(env));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  const commonTables = ['users', 'favorites', 'saved_items', 'watchlist', 'interactions'];
  
  for (const table of commonTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`Table '${table}' error:`, error.message);
      } else {
        console.log(`Table '${table}' exists. Columns:`, data.length > 0 ? Object.keys(data[0]) : 'no data');
      }
    } catch (e) {
      console.log(`Table '${table}' catch error`);
    }
  }
}

listTables();
