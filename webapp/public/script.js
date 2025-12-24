document.addEventListener('DOMContentLoaded', async () => {
    
    // --- Auth Check ---
    try {
        const authRes = await fetch('/check-auth');
        const authData = await authRes.json();
        
        if (!authData.loggedIn) {
            window.location.href = '/login.html';
            return;
        }
        
        document.getElementById('user-info').textContent = `Hi, ${authData.username}`;
    } catch (e) {
        console.error("Auth check failed", e);
        // Fallback for dev without server? No, redirects to login.
        window.location.href = '/login.html';
        return;
    }

    // --- Session State ---
    let currentSessionId = localStorage.getItem('chat_session_id') || generateSessionId();
    localStorage.setItem('chat_session_id', currentSessionId);

    // --- Logout Logic ---
    document.getElementById('logout-btn').addEventListener('click', async () => {
        await fetch('/logout', { method: 'POST' });
        localStorage.removeItem('chat_session_id'); // Clear session on logout
        window.location.href = '/login.html';
    });

    // --- New Chat Logic ---
    const newChatBtn = document.getElementById('new-chat-btn');
    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            currentSessionId = generateSessionId();
            localStorage.setItem('chat_session_id', currentSessionId);
            
            // Clear UI
            resetChatUI();
            
            // Refresh history list (to unselect previous)
            loadHistory();
        });
    }

    function resetChatUI() {
        document.getElementById('chat-messages').innerHTML = `
            <div class="message ai">
                Halo! 👋 Saya asisten virtual Honda. Ada yang bisa saya bantu mengenai produk atau layanan kami hari ini?
                <br><br>
                <small style="font-style: italic;">Chat baru dimulai.</small>
            </div>
            <div class="typing-indicator" id="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        `;
        document.getElementById('chat-input').value = '';
    }

    function generateSessionId() {
        // Simple UUID v4 replacement or random string
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // --- Load History ---
    loadHistory();

    async function loadHistory() {
        try {
            const res = await fetch('/history-sessions'); 
            if (!res.ok) {
                throw new Error(`Server returned ${res.status}`);
            }
            const sessions = await res.json();
            
            const historyList = document.getElementById('history-list');
            historyList.innerHTML = '';
            
            if (!Array.isArray(sessions)) {
                console.error("Invalid history response:", sessions);
                historyList.innerHTML = '<div style="text-align:center;color:#ef4444;font-size:0.8rem;">Gagal memuat history</div>';
                return;
            }
            
            if (sessions.length === 0) {
                historyList.innerHTML = '<div style="text-align:center;color:#6b7280;font-size:0.8rem;">Belum ada riwayat</div>';
                return;
            }

            sessions.forEach(session => {
                // Determine display text. Use 'Percakapan Tanpa Judul' if question is missing but it's a valid session
                const displayText = session.first_message || 'Percakapan Tanpa Judul';

                const item = document.createElement('div');
                item.classList.add('history-item');
                if (session.session_id === currentSessionId) {
                    item.style.backgroundColor = '#e5e7eb'; // Active state
                }

                // Text Container
                const textSpan = document.createElement('span');
                textSpan.textContent = displayText;
                // Fix truncation
                textSpan.style.flex = '1';
                textSpan.style.whiteSpace = 'nowrap'; 
                textSpan.style.overflow = 'hidden';
                textSpan.style.textOverflow = 'ellipsis';
                textSpan.style.display = 'block'; 
                
                // Click to load session
                textSpan.onclick = () => loadSessionChat(session.session_id);

                // Delete Button
                const deleteBtn = document.createElement('span');
                deleteBtn.innerHTML = '&times;'; 
                deleteBtn.style.color = '#991b1b';
                deleteBtn.style.fontWeight = 'bold';
                deleteBtn.style.padding = '0 5px';
                deleteBtn.style.borderRadius = '4px';
                deleteBtn.title = 'Hapus Chat';
                
                deleteBtn.onclick = async (e) => {
                    e.stopPropagation(); 
                    if (confirm('Hapus riwayat chat ini?')) {
                        await deleteSession(session.session_id);
                    }
                };

                item.appendChild(textSpan);
                item.appendChild(deleteBtn);
                historyList.appendChild(item);
            });
            
            loadSessionChat(currentSessionId, false);

        } catch (e) {
            console.error("Failed loading history", e);
            const historyList = document.getElementById('history-list');
            if(historyList) historyList.innerHTML = '<div style="text-align:center;color:#ef4444;font-size:0.7rem;">Error loading history</div>';
        }
    }

    async function loadSessionChat(sessionId, updateUi = true) {
        if (updateUi) {
            currentSessionId = sessionId;
            localStorage.setItem('chat_session_id', currentSessionId);
             const items = document.querySelectorAll('.history-item');
             items.forEach(i => i.style.backgroundColor = 'transparent');
            // Re-fetch list to update active highlight properly? Or just rely on re-clicking behavior
            // loadHistory(); 
        }

        try {
            const res = await fetch(`/history?session_id=${sessionId}`);
            const messages = await res.json();
            
            if (messages.length > 0) {
                const messagesContainer = document.getElementById('chat-messages');
                // Clear and rebuild
                messagesContainer.innerHTML = `
                    <div class="typing-indicator" id="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                `;
                
                const typingIndicator = document.getElementById('typing-indicator'); // Re-grab ref
                
                messages.forEach(msg => {
                   const msgDiv = document.createElement('div');
                   msgDiv.classList.add('message', msg.sender);
                   msgDiv.textContent = msg.message;
                   messagesContainer.insertBefore(msgDiv, typingIndicator);
                });
                
                // Restore typing indicator ref for global use?
                // The global var 'typingIndicator' is defined later, scope issue?
                // It is defined in 'Chat Logic' block.
            } else {
                 if(updateUi) resetChatUI(); // Empty session
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function deleteSession(sessionId) {
        try {
            await fetch(`/history/${sessionId}`, { method: 'DELETE' });
            if (currentSessionId === sessionId) {
                // Determine new session or reset
                currentSessionId = generateSessionId();
                localStorage.setItem('chat_session_id', currentSessionId);
                resetChatUI();
            }
            loadHistory(); // Refresh list
        } catch (e) {
            alert('Gagal menghapus history');
        }
    }

    // --- Chat Logic ---
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('chat-messages');
    // typingIndicator is inside messagesContainer, creating generic ref might be lost on clean.
    // Better to get it dynamically or ensure it exists.
    
    // Helper to getting typing indicator safely
    function getTypingIndicator() {
        let el = document.getElementById('typing-indicator');
        if (!el) {
            el = document.createElement('div');
            el.id = 'typing-indicator';
            el.className = 'typing-indicator';
            el.innerHTML = '<span></span><span></span><span></span>';
            document.getElementById('chat-messages').appendChild(el);
        }
        return el;
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        // Add User Message
        addMessageToUI(message, 'user');
        chatInput.value = '';

        // Show Typing Indicator
        showTyping(true);

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message: message,
                    session_id: currentSessionId // Send Session ID
                }) 
            });

            if (!response.ok) {
                if (response.status === 401) {
                    alert("Sesi habis. Silakan login kembali.");
                    window.location.reload();
                    return;
                }
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            // Hide Typing Indicator
            showTyping(false);

            // Add AI Response
            const aiResponse = data.answer || "Maaf, tidak ada jawaban.";
            addMessageToUI(aiResponse, 'ai');
            
            // Refresh history list to show new session title if it was new
            loadHistory();

        } catch (error) {
            console.error('Error:', error);
            showTyping(false);
            addMessageToUI("⚠️ Gagal terhubung ke server.", 'ai');
        }
    });

    function addMessageToUI(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        messageDiv.textContent = text;
        
        // Insert before typing indicator
        const typingInd = getTypingIndicator();
        messagesContainer.insertBefore(messageDiv, typingInd);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function showTyping(show) {
        const typingInd = getTypingIndicator();
        typingInd.style.display = show ? 'block' : 'none';
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
});
