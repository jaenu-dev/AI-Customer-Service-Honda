# PROJECT RAG — PROGRESS 1
## Setup Infrastruktur Dasar

**Nama** : Janu Farras Saguna  
**NIM** : 24523135  
**Tanggal** : [isi tanggal]

---

## 1. Tujuan
Pada progress ini dilakukan setup infrastruktur dasar yang diperlukan untuk mengembangkan sistem Retrieval Augmented Generation (RAG). Tools utama yang disiapkan adalah Docker, Node.js, n8n, VSCode, Git, GitHub, dan Ngrok.

---

## 2. Langkah-langkah Setup
1. Instalasi Docker Desktop dan verifikasi menggunakan `docker --version`.
2. Instalasi Node.js (LTS) dan verifikasi menggunakan `node -v`.
3. Instalasi n8n lokal dan menjalankan `n8n start` / Docker compose.
4. Instalasi VSCode sebagai IDE pengembangan.
5. Instalasi Git untuk version control serta setup repository GitHub.
6. Instalasi Ngrok dan menjalankan `ngrok http 5678` untuk menampilkan n8n ke internet.

---

## 3. Arsitektur Dasar
Workflow pada tahap awal:
- Telegram / WebApp (local) → n8n (localhost:5678)
- n8n → OpenAI API
- Semua berjalan di lokal dan siap digunakan untuk workflow selanjutnya.

Diagram arsitektur terlampir pada file `docs/n8n.png`.

---

## 4. Bukti & Artefak
- Link GitHub repo: [https://github.com/jaenu-dev/AI-Customer-Service-Honda]
- Screenshots tersimpan di folder: `/docs/screenshots/`
  - docker install
  - node.js install
  - git & vs code
  - n8n dashboard
  - ngrok URL aktif

---

## 5. Kesimpulan
Semua tools berhasil diinstal dan infrastruktur dasar telah siap sepenuhnya untuk melanjutkan ke Progress 2: integrasi Telegram → n8n → OpenAI.
