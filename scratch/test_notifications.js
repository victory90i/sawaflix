
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
    console.log('Testing connection...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
        console.error('User error:', userError);
    } else {
        console.log('User:', user ? user.id : 'Not logged in');
    }

    console.log('Testing notifications table...');
    const { data, error, count } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Notifications table error:', error);
    } else {
        console.log('Notifications count (head only would be better for count, but we want to see data):', count);
        console.log('Sample row (latest):', data[0]);
    }
}

test();
