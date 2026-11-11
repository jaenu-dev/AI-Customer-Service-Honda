const form = document.getElementById('auth-form');
const switchLink = document.getElementById('switch-link');
const title = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const switchText = document.getElementById('switch-text');
const errorMsg = document.getElementById('error-msg');

let isLogin = true;

switchLink.addEventListener('click', (e) => {
    e.preventDefault();
    isLogin = !isLogin;
    if (isLogin) {
        title.textContent = 'Login';
        submitBtn.textContent = 'Masuk';
        switchText.textContent = 'Belum punya akun?';
        switchLink.textContent = 'Daftar di sini';
    } else {
        title.textContent = 'Register';
        submitBtn.textContent = 'Daftar';
        switchText.textContent = 'Sudah punya akun?';
        switchLink.textContent = 'Login di sini';
    }
    errorMsg.style.display = 'none';
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const endpoint = isLogin ? '/login' : '/register';

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            if (isLogin) {
                window.location.href = '/';
            } else {
                alert('Registrasi berhasil! Silakan login.');
                switchLink.click(); // Switch back to login
            }
        } else {
            errorMsg.textContent = data.error || 'Terjadi kesalahan';
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        console.error(err);
        errorMsg.textContent = 'Gagal terhubung ke server';
        errorMsg.style.display = 'block';
    }
});
