document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('chat-messages');
    const typingIndicator = document.getElementById('typing-indicator');

    // ⚠️ IMPORTANT: Replace this with your actual Ngrok URL
    // Example: 'https://your-tunnel-id.ngrok-free.dev/webhook/honda-ai-cs'
    const N8N_WEBHOOK_URL = 'https://unmisguidedly-chaliced-shasta.ngrok-free.dev/webhook/honda-ai-cs';

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        // Add User Message
        addMessage(message, 'user');
        chatInput.value = '';

        // Show Typing Indicator
        showTyping(true);

        try {
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: message })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            
            // Hide Typing Indicator
            showTyping(false);

            // Add AI Response
            // Assuming n8n returns { "answer": "..." }
            const aiResponse = data.answer || data.output || "Maaf, saya tidak mengerti. Bisa ulangi?";
            addMessage(aiResponse, 'ai');

        } catch (error) {
            console.error('Error:', error);
            showTyping(false);
            addMessage("⚠️ Gagal terhubung ke server. Pastikan n8n dan Ngrok berjalan.", 'ai');
        }
    });

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        messageDiv.textContent = text;
        
        // Insert before typing indicator
        messagesContainer.insertBefore(messageDiv, typingIndicator);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function showTyping(show) {
        typingIndicator.style.display = show ? 'block' : 'none';
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
});
