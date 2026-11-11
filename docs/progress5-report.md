# PROJECT RAG — PROGRESS 5
## Integrasi Workflow 1 + Workflow 2 + Workflow 3

**Nama:** Janu Farras Saguna  
**NIM:** 24523135  
**Tanggal:** 2025-12-24

---

### 1. Tujuan
Mengintegrasikan seluruh komponen yang telah dibangun (Telegram Bot, WebApp, dan RAG Knowledge Base) menjadi satu kesatuan sistem. Tujuannya adalah memastikan user dapat bertanya melalui Telegram maupun WebApp, dan mendapatkan jawaban yang bersumber dari Knowledge Base (Pinecone) melalui AI Agent.

### 2. Skema Integrasi
Sistem menggunakan satu workflow utama (**Master AI Agents**) sebagai pusat logika.
*   **Triggers**:
    *   **Telegram**: Menerima pesan chat langsung.
    *   **WebApp**: Menerima HTTP POST dari local web app.
*   **Core Logic**:
    *   **Normalisasi**: Menyeragamkan format input dari kedua sumber.
    *   **AI Agent**: Menggunakan `gpt-4.1-mini` dengan tool `Knowledge Base` (Pinecone) dan `Google Search` (SerpAPI).
    *   **Logging**: Menyimpan question & answer ke Supabase.
*   **Response**: Router mengirimkan jawaban kembali ke platform yang sesuai (Telegram API / Webhook Response).

### 3. Artefak
*   **Link GitHub**: [https://github.com/jaenu-dev/AI-Customer-Service-Honda]
*   **Workflow File**: `/n8n/Master AI Agents.json` (Integrasi Utama)
*   **Repo WebApp**: `/webapp` folder.

### 4. Screenshot Bukti
1.  **Telegram Response**: Tampilan Chatbot di Telegram menjawab pertanyaan tentang produk Honda (Misal: "Berapa harga Brio?").
2.  **WebApp Response**: Tampilan WebApp di browser menampilkan jawaban yang sama/relevan.
3.  **n8n Execution**: Tampilan workflow Master AI Agents yang berjalan sukses (hijau) dari kedua source.

### 5. Kesimpulan
Integrasi End-to-End berhasil dilakukan. Sistem RAG kini dapat diakses melalui dua interface berbeda (Telegram dan Web) dengan basis pengetahuan yang sama.
