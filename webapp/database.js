require('dotenv').config({ quiet: true });
const { createClient } = require('@supabase/supabase-js');

// Server memakai service_role key (HANYA di server, jangan pernah dikirim ke browser / di-commit).
// Tabel dilindungi RLS tanpa policy untuk anon, jadi anon key yang bocor tidak bisa membaca data.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi. Lihat .env.example');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
});

module.exports = supabase;
