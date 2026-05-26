// ===== АВТОРИЗАЦИЯ =====

const headerLoginBtn = document.getElementById('headerLoginBtn');
const loginStatus = document.querySelector('.login-status');

function login() {
    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    
    const username = usernameInput ? usernameInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';
    
    if (username === APP_CONFIG.CREDENTIALS.USERNAME && password === APP_CONFIG.CREDENTIALS.PASSWORD) {
        AppState.isLoggedIn = true;
        saveHistory('Вход в систему', 'Администратор вошёл в систему');
        hideLoginModal();
        enableEditMode(true);
        
        const btnLogin = document.getElementById('btnLogin');
        const btnLogout = document.getElementById('btnLogout');
        if (btnLogin) btnLogin.style.display = 'none';
        if (btnLogout) btnLogout.style.display = 'block';
        
        if (loginStatus) {
            loginStatus.classList.remove('guest');
            loginStatus.classList.add('admin');
            loginStatus.innerHTML = '<i class="fas fa-user-shield"></i>';
        }
        
        updateModeIndicator();
        if (window.displayProducts) window.displayProducts(AppState.products);
        showStatus('Авторизация успешна! Режим редактирования включен', 'success');
    } else {
        showStatus('Неверное имя пользователя или пароль', 'error');
        if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus();
        }
    }
}

function logout() {
    AppState.isLoggedIn = false;
    enableEditMode(false);
    
    const btnLogin = document.getElementById('btnLogin');
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogin) btnLogin.style.display = 'block';
    if (btnLogout) btnLogout.style.display = 'none';
    
    if (loginStatus) {
        loginStatus.classList.remove('admin');
        loginStatus.classList.add('guest');
        loginStatus.innerHTML = '<i class="fas fa-user"></i>';
    }
    
    updateModeIndicator();
    if (window.displayProducts) window.displayProducts(AppState.products);
    showStatus('Режим редактирования выключен', 'success');
}

function updateModeIndicator() {
    const oldIndicator = document.querySelector('.mode-indicator');
    if (oldIndicator) oldIndicator.remove();
    
    const indicator = document.createElement('div');
    indicator.className = `mode-indicator ${AppState.isLoggedIn ? 'edit' : 'view'}`;
    indicator.innerHTML = `
        <i class="fas fa-${AppState.isLoggedIn ? 'unlock' : 'lock'}"></i>
        <span>${AppState.isLoggedIn ? 'Режим редактирования' : 'Режим просмотра'}</span>
    `;
    document.body.appendChild(indicator);
}

if (headerLoginBtn) {
    headerLoginBtn.addEventListener('click', () => {
        if (AppState.isLoggedIn) logout();
        else document.getElementById('btnLogin').click();
    });
}

window.login = login;
window.logout = logout;