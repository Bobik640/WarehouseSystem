// ===== КОНФИГУРАЦИЯ =====
const APP_CONFIG = {
    API_URL: 'https://warehousesystem-zljh.onrender.com/api/products',
    CREDENTIALS: {
        USERNAME: 'vladik',
        PASSWORD: 'rdwx174291'
    }
};

// ===== ГЛОБАЛЬНОЕ СОСТОЯНИЕ =====
const AppState = {
    products: [],
    isLoggedIn: false,
    isLoading: false,
    editingProductId: null,      // ID редактируемого товара
    currentProductIndex: 0,       // Текущий индекс в модалке
    currentAction: null,          // Текущее действие (add/reduce/delete)
    currentProductId: null        // ID товара для действия
};