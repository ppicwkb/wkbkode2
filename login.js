
// ====== KONFIGURASI LOGIN ======
const VALID_USERNAME = 'kode';
const VALID_PASSWORD = '1';
let isLoggedIn = false;

// ====== SAAT HALAMAN DIMUAT ======
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();

    const today = new Date().toISOString().split('T')[0];
    const tanggalInput = document.getElementById('tanggal');
    if (tanggalInput) tanggalInput.value = today;
});

// ====== CEK STATUS LOGIN ======
function checkLoginStatus() {
    isLoggedIn = sessionStorage.getItem('loggedIn') === 'true';
    if (!isLoggedIn) showLoginModal();
}

// ====== TAMPILKAN LOGIN MODAL ======
function showLoginModal() {
    const existing = document.getElementById('loginModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'loginModal';
    modal.className = 'login-modal';
    modal.innerHTML = `
        <div class="login-box glass-effect">
            <div class="login-header">
                <div class="login-svg-icon">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="#007bff" opacity="0.15"/>
                        <path d="M12 1a11 11 0 1 0 11 11A11 11 0 0 0 12 1Zm0 16a1 1 0 1 1-1 1 1 1 0 0 1 1-1Zm1-4.93V15a1 1 0 0 1-2 0v-3.93a1 1 0 0 1 2 0Z" fill="#007bff"/>
                    </svg>
                </div>
                <h2>Akses Sistem</h2>
                <p>Masukkan username & password</p>
            </div>

            <form id="loginForm" class="login-form">
                <div id="loginError" class="login-error">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="#ff4d4f" stroke-width="2"/>
                        <path stroke="#ff4d4f" stroke-width="2" d="M12 8v5m0 3h.01"/>
                    </svg>
                    <span>Username atau password salah</span>
                </div>

                <div class="input-group">
                    <label for="loginUsername">
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                            <circle cx="12" cy="7" r="4" stroke="#007bff" stroke-width="2"/>
                            <path stroke="#007bff" stroke-width="2" d="M5.5 21a6.5 6.5 0 0 1 13 0Z"/>
                        </svg>
                        Username
                    </label>
                    <input id="loginUsername" type="text" placeholder="Masukkan username" required autofocus>
                </div>

                <div class="input-group">
                    <label for="loginPassword">
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                            <rect x="4" y="10" width="16" height="10" rx="2" stroke="#007bff" stroke-width="2"/>
                            <path stroke="#007bff" stroke-width="2" d="M8 10V7a4 4 0 0 1 8 0v3"/>
                        </svg>
                        Password
                    </label>
                    <input id="loginPassword" type="password" placeholder="Masukkan password" required>
                </div>

                <button type="submit" class="login-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M3 12h13M12 5l7 7-7 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>Masuk</span>
                </button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.classList.add('locked');
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

// ====== PROSES LOGIN ======
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const btn = e.target.querySelector('.login-btn');
    const error = document.getElementById('loginError');

    error.classList.remove('show');

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        sessionStorage.setItem('loggedIn', 'true');

        // Spinner animasi
        btn.innerHTML = `
            <svg class="spinner" width="20" height="20" viewBox="0 0 50 50">
                <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
            </svg>
            <span>Memverifikasi...</span>
        `;
        btn.disabled = true;

        setTimeout(() => {
            btn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2" opacity="0.4"/>
                    <path d="M8 12l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Berhasil</span>
            `;
            setTimeout(() => {
                document.getElementById('loginModal')?.remove();
                document.body.classList.remove('locked');
            }, 800);
        }, 1200);
    } else {
        error.classList.add('show');
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginUsername').focus();
    }
}
