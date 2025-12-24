require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const supabase = require('./database');
const fetch = require('node-fetch'); // Requires node-fetch@2

const app = express();
const port = 3000;
// Use 127.0.0.1 because Ngrok is DOWN/Unreachable
const N8N_WEBHOOK_URL = 'http://127.0.0.1:5678/webhook/honda-ai-cs';

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'honda-ai-secret-key-12345',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// --- Routes (Auth & History preserved) ---

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const { error } = await supabase.from('users').insert([{ username, password: hashedPassword }]);
    if (error) {
        console.error('Supabase Register Error:', error); // Debug log
        return res.status(400).json({ error: 'Username exists or error' });
    }
    res.json({ message: 'Success' });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    const { data: user, error } = await supabase.from('users').select('*').eq('username', username).single();
    
    if (error || !user) {
        return res.status(401).json({ error: 'Invalid username' });
    }
    
    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid password' });
    }

    req.session.userId = user.id;
    req.session.username = user.username;
    res.json({ message: 'Success' });
});

app.post('/logout', (req, res) => { req.session.destroy(); res.json({ message: 'Success' }); });
app.get('/check-auth', (req, res) => res.json({ loggedIn: !!req.session.userId, username: req.session.username }));

app.get('/history-sessions', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });

    // Fetch distinct sessions and their first message
    // Note: Supabase doesn't support 'distinct on' easily via JS client for complex queries without RPC.
    // simpler approach: Fetch ALL history for user, then group in JS.
    // Optimized way: create a view or RPC, but for now JS grouping.
    
    const { data: rows, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', req.session.userId)
        .order('created_at', { ascending: false }); // Newest first

    if (error) {
        console.error('Supabase History Error:', error);
        return res.json([]);
    }

    const sessions = {};
    const safeRows = rows || [];
    
    safeRows.forEach(row => {
        const sid = row.session_id || 'legacy'; // Handle old chats without session_id
        if (!sessions[sid]) {
            sessions[sid] = {
                session_id: sid,
                first_message: row.question, 
                timestamp: row.created_at
            };
        }
    });

    // Convert to array
    const sessionList = Object.values(sessions);
    res.json(sessionList);
});

app.get('/history', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const sessionId = req.query.session_id;
    let query = supabase.from('chat_history').select('*').eq('user_id', req.session.userId);
    
    if (sessionId) {
        query = query.eq('session_id', sessionId);
    } else {
        // If no session specified, maybe return nothing or legacy?
        // Let's return legacy (null session_id)
        // query = query.is('session_id', null); 
        // Or just nothing to force frontend to pick a session.
        return res.json([]); 
    }
    
    const { data: rows } = await query.order('created_at', { ascending: true });

    // Flatten Q&A rows into linear messages for UI
    const messages = [];
    if (rows) {
        rows.forEach(row => {
            if (row.question) messages.push({ sender: 'user', message: row.question, timestamp: row.created_at });
            if (row.answer) messages.push({ sender: 'ai', message: row.answer, timestamp: row.created_at });
        });
    }
    res.json(messages);
});

app.delete('/history/:sessionId', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
    const { sessionId } = req.params;
    
    const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', req.session.userId)
        .eq('session_id', sessionId);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Deleted' });
});

// --- Chat Route (Updated) ---
app.post('/chat', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
    
    try {
        const fetchFunc = await import('node-fetch').then(mod => mod.default || mod);
        
        const n8nRes = await fetchFunc(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                question: req.body.message, 
                user_id: req.session.userId,
                session_id: req.body.session_id // Pass session ID
            }) 
        });

        console.log(`N8N Response Status: ${n8nRes.status} ${n8nRes.statusText}`); 
        const text = await n8nRes.text();
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('Failed to parse N8N JSON:', e);
            throw new Error('Invalid JSON from N8N');
        }

        if (Array.isArray(data) && data.length > 0) {
            data = data[0]; 
        }

        const aiResponse = data.answer || data.output || "No response";
        res.json({ answer: aiResponse });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'AI Error' });
    }
});

app.listen(port, () => console.log(`Server at http://localhost:${port}`));