require('dotenv').config({ quiet: true });
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const supabase = require('./database');

// ---------------------------------------------------------------------------
// Config — semua nilai rahasia diambil dari environment, tidak ada yang di-hardcode
// ---------------------------------------------------------------------------
const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';
const SESSION_SECRET = process.env.SESSION_SECRET;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://127.0.0.1:5678/webhook/honda-ai-cs';
const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET;

if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
    throw new Error('SESSION_SECRET wajib diisi (minimal 32 karakter). Lihat .env.example');
}
if (!N8N_WEBHOOK_SECRET) {
    throw new Error('N8N_WEBHOOK_SECRET wajib diisi. Lihat .env.example');
}

const app = express();
app.disable('x-powered-by');
if (IS_PROD) app.set('trust proxy', 1); // supaya req.ip & cookie secure benar di belakang proxy (Vercel/nginx)

// ---------------------------------------------------------------------------
// Security headers
// ---------------------------------------------------------------------------
app.use((req, res, next) => {
    res.set({
        'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src https://fonts.gstatic.com",
            "img-src 'self' data:",
            "connect-src 'self'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ].join('; '),
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    });
    if (IS_PROD) res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});

app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    name: 'hcs.sid',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: IS_PROD,
        maxAge: 24 * 60 * 60 * 1000,
    },
}));

// ---------------------------------------------------------------------------
// Rate limiter sederhana (in-memory, fixed window) — tanpa dependency tambahan
// ---------------------------------------------------------------------------
function rateLimit({ windowMs, max, name }) {
    const hits = new Map();
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of hits) if (entry.reset <= now) hits.delete(key);
    }, windowMs).unref();

    return (req, res, next) => {
        const key = `${name}:${req.ip}`;
        const now = Date.now();
        let entry = hits.get(key);
        if (!entry || entry.reset <= now) {
            entry = { count: 0, reset: now + windowMs };
            hits.set(key, entry);
        }
        entry.count += 1;
        if (entry.count > max) {
            res.set('Retry-After', Math.ceil((entry.reset - now) / 1000));
            return res.status(429).json({ error: 'Terlalu banyak permintaan, coba lagi nanti.' });
        }
        next();
    };
}

const authLimiter = rateLimit({ name: 'auth', windowMs: 15 * 60 * 1000, max: 10 });
const chatLimiter = rateLimit({ name: 'chat', windowMs: 60 * 1000, max: 15 });

// ---------------------------------------------------------------------------
// Validasi input
// ---------------------------------------------------------------------------
const USERNAME_RE = /^[a-zA-Z0-9_.]{3,32}$/;

function validateCredentials(body) {
    const { username, password } = body || {};
    if (typeof username !== 'string' || !USERNAME_RE.test(username)) {
        return 'Username 3–32 karakter (huruf, angka, _ atau .)';
    }
    // bcrypt hanya memproses 72 byte pertama
    if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72) {
        return 'Password minimal 8 karakter (maksimal 72 byte)';
    }
    return null;
}

function requireAuth(req, res, next) {
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
    next();
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
app.post('/register', authLimiter, async (req, res) => {
    const invalid = validateCredentials(req.body);
    if (invalid) return res.status(400).json({ error: invalid });

    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    const { error } = await supabase.from('users').insert([{ username, password: hashedPassword }]);
    if (error) {
        console.error('Register error:', error.code);
        return res.status(400).json({ error: 'Registrasi gagal. Coba username lain.' });
    }
    res.json({ message: 'Success' });
});

app.post('/login', authLimiter, async (req, res) => {
    const { username, password } = req.body || {};
    // Pesan error sengaja dibuat sama supaya tidak bisa dipakai untuk menebak username yang terdaftar
    const fail = () => res.status(401).json({ error: 'Username atau password salah' });
    if (typeof username !== 'string' || typeof password !== 'string') return fail();

    const { data: user } = await supabase
        .from('users')
        .select('id, username, password')
        .eq('username', username)
        .maybeSingle();

    const ok = user ? await bcrypt.compare(password, user.password) : false;
    if (!ok) return fail();

    // Ganti session ID setelah login untuk mencegah session fixation
    req.session.regenerate((err) => {
        if (err) return res.status(500).json({ error: 'Session error' });
        req.session.userId = user.id;
        req.session.username = user.username;
        res.json({ message: 'Success' });
    });
});

app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('hcs.sid');
        res.json({ message: 'Success' });
    });
});

app.get('/check-auth', (req, res) => {
    res.json({ loggedIn: !!req.session.userId, username: req.session.username });
});

// ---------------------------------------------------------------------------
// Riwayat chat — semua query selalu difilter dengan user_id dari session
// ---------------------------------------------------------------------------
app.get('/history-sessions', requireAuth, async (req, res) => {
    const { data: rows, error } = await supabase
        .from('chat_history')
        .select('session_id, question, created_at')
        .eq('user_id', req.session.userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('History error:', error.code);
        return res.json([]);
    }

    const sessions = {};
    (rows || []).forEach((row) => {
        const sid = row.session_id || 'legacy';
        if (!sessions[sid]) {
            sessions[sid] = { session_id: sid, first_message: row.question, timestamp: row.created_at };
        }
    });
    res.json(Object.values(sessions));
});

app.get('/history', requireAuth, async (req, res) => {
    const sessionId = req.query.session_id;
    if (typeof sessionId !== 'string' || !sessionId) return res.json([]);

    const { data: rows } = await supabase
        .from('chat_history')
        .select('question, answer, created_at')
        .eq('user_id', req.session.userId)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

    const messages = [];
    (rows || []).forEach((row) => {
        if (row.question) messages.push({ sender: 'user', message: row.question, timestamp: row.created_at });
        if (row.answer) messages.push({ sender: 'ai', message: row.answer, timestamp: row.created_at });
    });
    res.json(messages);
});

app.delete('/history/:sessionId', requireAuth, async (req, res) => {
    const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', req.session.userId)
        .eq('session_id', req.params.sessionId);

    if (error) return res.status(500).json({ error: 'Gagal menghapus riwayat' });
    res.json({ message: 'Deleted' });
});

// ---------------------------------------------------------------------------
// Chat → n8n (webhook dilindungi header secret)
// ---------------------------------------------------------------------------
app.post('/chat', requireAuth, chatLimiter, async (req, res) => {
    const { message, session_id: sessionId } = req.body || {};
    if (typeof message !== 'string' || !message.trim() || message.length > 1000) {
        return res.status(400).json({ error: 'Pesan wajib diisi (maksimal 1000 karakter)' });
    }

    try {
        const n8nRes = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Token': N8N_WEBHOOK_SECRET,
            },
            body: JSON.stringify({
                question: message.trim(),
                user_id: req.session.userId,
                session_id: typeof sessionId === 'string' ? sessionId : crypto.randomUUID(),
            }),
            signal: AbortSignal.timeout(60_000),
        });

        if (!n8nRes.ok) throw new Error(`n8n responded ${n8nRes.status}`);

        let data = await n8nRes.json();
        if (Array.isArray(data)) data = data[0] || {};
        res.json({ answer: data.answer || data.output || 'No response' });
    } catch (error) {
        console.error('Chat error:', error.message);
        res.status(502).json({ error: 'AI sedang tidak tersedia' });
    }
});

// Error handler terakhir — jangan bocorkan stack trace ke client
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: 'Terjadi kesalahan pada server' });
});

// Jalan sebagai server biasa secara lokal, dan diekspor untuk Vercel
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server at http://localhost:${PORT}`));
}
module.exports = app;
