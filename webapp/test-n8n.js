// Wrapper for node-fetch v3 in CommonJS
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const localUrl = 'http://127.0.0.1:5678/webhook/honda-ai-cs';
const ngrokUrl = 'https://unmisguidedly-chaliced-shasta.ngrok-free.dev/webhook/honda-ai-cs';

async function testConnection(url, name) {
    console.log(`Testing ${name}: ${url}...`);
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: 'Test Probe', user_id: 'probe_123', source: 'web' })
        });
        console.log(`✅ ${name} SUCCESS: Status ${res.status} ${res.statusText}`);
        const text = await res.text();
        console.log(`   Body: ${text}`); // Print FULL body
    } catch (e) {
        console.error(`❌ ${name} FAILED: ${e.message}`);
    }
}

async function run() {
    await testConnection(localUrl, 'Localhost');
    await testConnection(ngrokUrl, 'Ngrok');
}

run();
