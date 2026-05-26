// ===== МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ =====

function createLoginModal() {
    const modalHTML = `
        <dialog id="loginModal">
            <h3><i class="fas fa-lock"></i> Авторизация</h3>
            <div class="form-group">
                <label for="loginUsername">Имя пользователя</label>
                <input type="text" id="loginUsername" class="form-control" placeholder="Введите имя" value="vladik">
            </div>
            <div class="form-group">
                <label for="loginPassword">Пароль</label>
                <input type="password" id="loginPassword" class="form-control" placeholder="Введите пароль">
            </div>
            <div class="modal-buttons">
                <button class="btn btn-success" id="modalLoginBtn">
                    <i class="fas fa-sign-in-alt"></i> Войти
                </button>
                <button class="btn btn-secondary" id="modalCloseBtn">
                    <i class="fas fa-times"></i> Отмена
                </button>
            </div>
        </dialog>
    `;
    document.getElementById('modalContainer').innerHTML = modalHTML;
}

function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.showModal();
        const passwordInput = document.getElementById('loginPassword');
        if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus();
        }
    }
}

function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal && modal.open) modal.close();
}

window.showLoginModal = showLoginModal;
window.hideLoginModal = hideLoginModal;