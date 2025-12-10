# PROJECT RAG — PROGRESS 4
## Workflow 3 (Google Drive → Embedding → Pinecone)

**Nama:** Janu Farras Saguna  
**NIM:** 24523135  
**Tanggal:** 2025-12-08

---

### 1. Tujuan
Membangun **Knowledge Base** (Database Pengetahuan) untuk AI. Sistem ini akan membaca dokumen PDF dari Google Drive, memecahnya menjadi bagian-bagian kecil (chunking), mengubahnya menjadi vector embedding menggunakan OpenAI, dan menyimpannya ke dalam database vektor Pinecone.

### 2. Skema Data & Arsitektur
*   **Source**: Google Drive folder (PDF / Markdown Files).
*   **Processing (n8n)**:
    1.  **Download**: Mengunduh file binary.
    2.  **Loader**: Membaca konten teks dari dokumen (PDF/MD).
    3.  **Splitter**: Memotong teks menjadi chunk (500 karakter).
    4.  **Embedding**: `text-embedding-3-small` (OpenAI).
*   **Destination**: Pinecone Index (`honda-ai-cs`).
    *   **Dimension**: 1536
    *   **Metric**: Cosine

### 3. Artefak
*   **Link GitHub**: [https://github.com/jaenu-dev/AI-Customer-Service-Honda]
*   **Workflow File**: `/n8n/RAG Honda AI CS.json`

### 4. Screenshot Bukti
1.  **Pinecone Index**: Tampilan dashboard Pinecone yang menunjukkan index berhasil dibuat.
2.  **Vector Count**: Tampilan jumlah vektor yang masuk (bukan 0).
3.  **n8n Execution**: Workflow berhasil berjalan hijau.

### 5. Kesimpulan
Database vektor berhasil dibangun. AI sekarang memiliki "otak" eksternal yang berisi pengetahuan spesifik tentang produk Honda, yang akan digunakan untuk pencarian (Retrieval) pada Progress selanjutnya.
