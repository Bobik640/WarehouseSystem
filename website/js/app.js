function initApp() {
    setupSearch();
    createLoginModal();
    setupEventListeners();
    setupCategoryListener();  // Добавлено для показа поля срока годности при выборе "Продукты"
    loadProducts();
    
    setInterval(function() {
        if (AppState.products.length > 0) {
            updateStats();
        } else {
            loadProducts();
        }
    }, 30000);
}

function setupSearch(){

    var searchInput =
        document.getElementById(
            'searchInput'
        );

    if(!searchInput) return;

    searchInput.addEventListener(
        'input',
        function(){

            var value =
                this.value.toLowerCase();

            var filtered =
                AppState.products.filter(
                    function(product){

                        return (
                            product.name
                            .toLowerCase()
                            .includes(value)
                        );
                    }
                );

            displayProducts(filtered);
        }
    );
}

function setupEventListeners() {
    var btnAdd = document.getElementById('btnAdd');
    if (btnAdd) btnAdd.addEventListener('click', addNewProduct);
    
    var btnLogin = document.getElementById('btnLogin');
    var btnLogout = document.getElementById('btnLogout');
    if (btnLogin) btnLogin.addEventListener('click', showLoginModal);
    if (btnLogout) btnLogout.addEventListener('click', logout);
    
    var refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) refreshBtn.addEventListener('click', loadProducts);
    
    document.addEventListener('click', function(e) {
        if (e.target.id === 'modalLoginBtn') {
            login();
        }
        if (e.target.id === 'modalCloseBtn') {
            hideLoginModal();
        }
    });

    function setupCategoryListener() {
    const categorySelect = document.getElementById('productCategory');
    const expiryGroup = document.getElementById('expiryDateGroup');

    if (!categorySelect) return;

    categorySelect.addEventListener('change', function () {
        const category = categorySelect.value;

        if (category === 'Продукты') {
            expiryGroup.style.display = 'block';
        } else {
            expiryGroup.style.display = 'none';
        }
    });
}
    
    document.addEventListener('click', function(e) {
        var modal = document.getElementById('loginModal');
        if (e.target === modal) {
            hideLoginModal();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            var modal = document.getElementById('loginModal');
            if (modal && modal.open) {
                hideLoginModal();
            }
        }
    });
    
    var loginUsername = document.getElementById('loginUsername');
    var loginPassword = document.getElementById('loginPassword');
    
    if (loginUsername) {
        loginUsername.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') login();
        });
    }
    
    if (loginPassword) {
        loginPassword.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') login();
        });
    }
}

document.addEventListener('DOMContentLoaded', initApp);