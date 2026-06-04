
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
    console.log('Testing unread count with is_read column...');
    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Unread count (is_read=false):', count);
    }

    console.log('Testing unread count with read column (should fail)...');
    const { count: countOld, error: errorOld } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('read', false);

    if (errorOld) {
        console.log('Old column correctly failed:', errorOld.message);
    } else {
        console.warn('Old column UNEXPECTEDLY succeeded!');
    }
}

test();
