const headerLoginBtn = document.getElementById('headerLoginBtn');
const loginStatus = document.querySelector('.login-status');


/* ===================================================== */
/* ================= LOGIN ============================= */
/* ===================================================== */

function login() {

    var usernameInput = document.getElementById('loginUsername');
    var passwordInput = document.getElementById('loginPassword');

    var username = usernameInput
        ? usernameInput.value.trim()
        : '';

    var password = passwordInput
        ? passwordInput.value
        : '';


    if (
        username === APP_CONFIG.CREDENTIALS.USERNAME &&
        password === APP_CONFIG.CREDENTIALS.PASSWORD
    ) {

        AppState.isLoggedIn = true;

        saveHistory(

        'Вход в систему',

        'Администратор вошёл в систему'
        );

        hideLoginModal();

        enableEditMode(true);


        var btnLogin = document.getElementById('btnLogin');
        var btnLogout = document.getElementById('btnLogout');

        if (btnLogin) btnLogin.style.display = 'none';
        if (btnLogout) btnLogout.style.display = 'block';


        /* ===== HEADER STATUS ===== */

        if (loginStatus) {

            loginStatus.classList.remove('guest');

            loginStatus.classList.add('admin');

            loginStatus.innerHTML =
                '<i class="fas fa-user-shield"></i>';
        }


        updateModeIndicator();


        if (window.displayProducts) {

            window.displayProducts(AppState.products);

        }

        showStatus(
            'Авторизация успешна! Режим редактирования включен',
            'success'
        );

    } else {

        showStatus(
            'Неверное имя пользователя или пароль',
            'error'
        );

        if (passwordInput) {

            passwordInput.value = '';

            passwordInput.focus();
        }
    }
}


/* ===================================================== */
/* ================= LOGOUT ============================ */
/* ===================================================== */

function logout() {

    AppState.isLoggedIn = false;

    enableEditMode(false);


    var btnLogin = document.getElementById('btnLogin');
    var btnLogout = document.getElementById('btnLogout');

    if (btnLogin) btnLogin.style.display = 'block';
    if (btnLogout) btnLogout.style.display = 'none';


    /* ===== HEADER STATUS ===== */

    if (loginStatus) {

        loginStatus.classList.remove('admin');

        loginStatus.classList.add('guest');

        loginStatus.innerHTML =
            '<i class="fas fa-user"></i>';
    }


    updateModeIndicator();


    if (window.displayProducts) {

        window.displayProducts(AppState.products);

    }

    showStatus(
        'Режим редактирования выключен',
        'success'
    );
}


/* ===================================================== */
/* ================= ENABLE EDIT ======================= */
/* ===================================================== */

function enableEditMode(enable) {

    var formControls =

        document.querySelectorAll(
            '.product-form input, .product-form textarea, .product-form select'
        );

    for (var i = 0; i < formControls.length; i++) {

        formControls[i].disabled = !enable;
    }

    var btnAdd = document.getElementById('btnAdd');

    if (btnAdd)
        btnAdd.disabled = !enable;
}

/* ===================================================== */
/* ================= MODE INDICATOR ==================== */
/* ===================================================== */

function updateModeIndicator() {

    var oldIndicator =
        document.querySelector('.mode-indicator');

    if (oldIndicator) oldIndicator.remove();


    var indicator = document.createElement('div');

    indicator.className =
        'mode-indicator ' +
        (AppState.isLoggedIn ? 'edit' : 'view');


    indicator.innerHTML =

        '<i class="fas fa-' +

        (AppState.isLoggedIn
            ? 'unlock'
            : 'lock') +

        '"></i>' +

        '<span>' +

        (AppState.isLoggedIn
            ? 'Режим редактирования'
            : 'Режим просмотра') +

        '</span>';


    document.body.appendChild(indicator);
}


/* ===================================================== */
/* ================= HEADER BUTTON ===================== */
/* ===================================================== */

if (headerLoginBtn) {

    headerLoginBtn.addEventListener('click', function () {

        if (AppState.isLoggedIn) {

            logout();

        } else {

            document
                .getElementById('btnLogin')
                .click();
        }
    });
}


window.login = login;
window.logout = logout;