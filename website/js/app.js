// ===== ГЛАВНАЯ ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ =====

function initApp() {
    console.log('🚀 Инициализация приложения...');
    
    // 1. Создаём модальное окно авторизации
    createLoginModal();
    
    // 2. Настраиваем поиск и фильтры
    setupSearchAndFilters();
    
    // 3. Настраиваем слушатели категорий для формы добавления
    setupCategoryListener();
    
    // 4. Настраиваем предпросмотр изображения
    setupImagePreview();
    
    // 5. Настраиваем все глобальные слушатели
    setupGlobalEventListeners();
    
    // 6. Загружаем товары
    loadProducts();
    
    // 7. Обновляем статистику каждые 30 секунд
    setInterval(() => {
        if (AppState.products.length > 0) {
            updateStats();
        } else {
            loadProducts();
        }
    }, 30000);
}

function setupSearchAndFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
}

function setupGlobalEventListeners() {
    // Кнопки авторизации
    const btnLogin = document.getElementById('btnLogin');
    const btnLogout = document.getElementById('btnLogout');
    const refreshBtn = document.getElementById('refreshBtn');
    const btnAdd = document.getElementById('btnAdd');
    
    if (btnLogin) btnLogin.addEventListener('click', showLoginModal);
    if (btnLogout) btnLogout.addEventListener('click', logout);
    if (refreshBtn) refreshBtn.addEventListener('click', loadProducts);
    if (btnAdd) btnAdd.addEventListener('click', addNewProduct);
    
    // Клики по модалке
    document.addEventListener('click', (e) => {
        if (e.target.id === 'modalLoginBtn') login();
        if (e.target.id === 'modalCloseBtn') hideLoginModal();
    });
    
    // Закрытие модалки по клику вне
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('loginModal');
        if (e.target === modal) hideLoginModal();
    });
    
    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('loginModal');
            if (modal && modal.open) hideLoginModal();
        }
    });
    
    // Enter в полях логина
    const loginUsername = document.getElementById('loginUsername');
    const loginPassword = document.getElementById('loginPassword');
    if (loginUsername) loginUsername.addEventListener('keypress', (e) => e.key === 'Enter' && login());
    if (loginPassword) loginPassword.addEventListener('keypress', (e) => e.key === 'Enter' && login());
    
    // Экспорт меню
    const exportBtn = document.getElementById('exportBtn');
    const exportMenu = document.getElementById('exportMenu');
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    
    if (exportBtn && exportMenu) {
        exportBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            exportMenu.classList.toggle('active');
        });
        
        document.addEventListener('click', (e) => {
            if (exportMenu && !e.target.closest('.export-wrapper')) {
                exportMenu.classList.remove('active');
            }
        });
    }
    
    if (exportExcelBtn) exportExcelBtn.addEventListener('click', exportToExcel);
    if (exportPdfBtn) exportPdfBtn.addEventListener('click', exportToPDF);
    
    // Уведомления
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationOverlay = document.getElementById('notificationOverlay');
    const closeNotificationsBtn = document.getElementById('closeNotificationsBtn');
    const clearNotificationsBtn = document.getElementById('clearNotificationsBtn');
    
    updateNotificationBadge();
    
    if (notificationBtn && notificationOverlay) {
        notificationBtn.addEventListener('click', () => {
            notificationOverlay.classList.add('active');
            renderNotifications();
        });
    }
    
    if (closeNotificationsBtn && notificationOverlay) {
        closeNotificationsBtn.addEventListener('click', () => notificationOverlay.classList.remove('active'));
    }
    
    if (clearNotificationsBtn) {
        clearNotificationsBtn.addEventListener('click', () => {
            localStorage.removeItem('warehouseNotifications');
            renderNotifications();
            updateNotificationBadge();
        });
    }
    
    // Модалки товаров
    const closeProductModalBtn = document.getElementById('closeProductModal');
    const nextProductBtn = document.getElementById('nextProductBtn');
    const prevProductBtn = document.getElementById('prevProductBtn');
    
    if (closeProductModalBtn) closeProductModalBtn.addEventListener('click', closeProductModal);
    if (nextProductBtn) nextProductBtn.addEventListener('click', nextProduct);
    if (prevProductBtn) prevProductBtn.addEventListener('click', prevProduct);
    
    // Модалка действий
    const closeActionModalBtn = document.getElementById('closeActionModal');
    const cancelActionBtn = document.getElementById('cancelActionBtn');
    const confirmActionBtn = document.getElementById('confirmActionBtn');
    
    if (closeActionModalBtn) closeActionModalBtn.addEventListener('click', closeActionModal);
    if (cancelActionBtn) cancelActionBtn.addEventListener('click', closeActionModal);
    if (confirmActionBtn) confirmActionBtn.addEventListener('click', confirmAction);
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', initApp);