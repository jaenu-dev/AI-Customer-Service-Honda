require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ MISSING CREDENTIALS');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
    console.log('Checking if user exists...');
    const { data, error } = await supabase
        .from('users')
        .select('*');

    if (error) {
        console.error('Query Failed:', error);
    } else {
        console.log('Current Users:', data);
    }
}

checkUser();
