const express = require('express');
const path = require('path');
const app = express();
// Menggunakan port 3000 untuk WebApp Anda
const port = 3000; 

// Menyajikan file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`✅ Honda AI CS WebApp berjalan di http://localhost:${port}`);
  console.log('Pastikan Ngrok untuk n8n juga berjalan.');
});