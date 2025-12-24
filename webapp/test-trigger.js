// Wrapper for node-fetch v3 in CommonJS
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// EXACT URL from user's index.js
const url = 'http://127.0.0.1:5678/webhook-test/honda-ai-cs';

async function test() {
    console.log(`🚀 Sending Test Request to: ${url}`);
    
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                question: 'TEST TRIGGER ONLY',
                user_id: 12345,
                source: 'web'
            })
        });

        console.log(`\n📊 STATUS: ${res.status} ${res.statusText}`);
        const text = await res.text();
        console.log(`📦 RESPONSE BODY: ${text}`);

        if (text.includes("Error in workflow")) {
             console.log("\n✅ CONCLUSION: Connection successful (Trigger HIT), but Workflow Failed later.");
        } else if (res.status === 200) {
             console.log("\n✅ CONCLUSION: Trigger Working Perfectly.");
        } else {
             console.log("\n❌ CONCLUSION: Connection Failed (Trigger NOT Hit).");
        }

    } catch (e) {
        console.error(`\n🔥 FATAL ERROR: ${e.message}`);
    }
}

test();
