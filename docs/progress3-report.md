# PROJECT RAG — PROGRESS 3
## Workflow 2 (Local WebApp → Webhook → n8n → OpenAI)

**Nama:** Janu Farras Saguna  
**NIM:** 24523135  
**Tanggal:** 2025-12-01

---

### 1. Tujuan
Membangun **Workflow 2** yang menghubungkan WebApp lokal (dengan antarmuka chat premium) ke n8n melalui Webhook. WebApp mengirimkan pertanyaan pengguna ke n8n, yang kemudian diproses oleh OpenAI, dan jawabannya dikembalikan ke WebApp.

### 2. Alur Data (Data Flow)
1.  **User Input**: Pengguna mengetik pertanyaan di WebApp (Localhost).
2.  **HTTP Request**: WebApp mengirimkan `POST` request (JSON) ke URL Ngrok Webhook.
3.  **n8n Webhook**: Node Webhook di n8n menerima data.
4.  **OpenAI Processing**: n8n mengirimkan prompt ke OpenAI.
5.  **Response**: OpenAI mengembalikan teks jawaban.
6.  **Webhook Response**: n8n mengirimkan jawaban kembali ke WebApp sebagai respons HTTP.
7.  **UI Update**: WebApp menampilkan jawaban di layar chat.

### 3. Artefak
*   **Link GitHub**: [https://github.com/jaenu-dev/AI-Customer-Service-Honda]
*   **File WebApp**: `/webapp` (index.html, style.css, script.js)
*   **File Workflow**: `/n8n/WebApp AI CS Honda.json`

### 4. Screenshot Bukti
*(Silakan tambahkan screenshot berikut manual atau saat pengumpulan)*
1.  **WebApp Interface**: Tampilan chat yang modern.
2.  **n8n Execution**: Tampilan workflow n8n yang berhasil dijalankan (hijau).
3.  **Chat Interaction**: Bukti tanya jawab di WebApp.

### 5. Kesimpulan
Progress 3 berhasil diselesaikan. WebApp kini memiliki antarmuka yang responsif dan modern, serta terintegrasi penuh dengan n8n melalui Webhook. Sistem siap untuk tahap deployment selanjutnya.
