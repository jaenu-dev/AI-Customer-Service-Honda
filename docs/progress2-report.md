PROJECT RAG — PROGRESS 2
Workflow 1 (Telegram → n8n → OpenAI → Telegram)

Nama: Janu Farras Saguna
NIM: 24523135
Tanggal: [isi]

1. Tujuan

Membangun Workflow 1 untuk menerima pesan dari Telegram, memprosesnya melalui OpenAI menggunakan n8n, dan mengirim balasan kembali ke Telegram.

2. Alur Workflow

Telegram Bot menerima pesan dari user.

Ngrok digunakan untuk membuat webhook publik ke n8n.

Node n8n:

Telegram Trigger

OpenAI (Chat Model)

Telegram Send Message

OpenAI menghasilkan respon berdasarkan input user.

n8n mengirimkan balasan ke Telegram.

3. Artefak

Link GitHub: [https://github.com/jaenu-dev/AI-Customer-Service-Honda]

File workflow: n8n/Telegram AI CS Honda.json

URL Ngrok (sementara):
https://unmisguidedly-chaliced-shasta.ngrok-free.dev

Screenshots:

Bot Telegram berhasil membalas

n8n workflow

ngrok running

4. Kesimpulan

Workflow berhasil digunakan sebagai AI Chat Assistant berbasis Telegram, menggunakan n8n dan OpenAI API. Sistem berjalan end-to-end melalui webhook publik menggunakan Ngrok.
