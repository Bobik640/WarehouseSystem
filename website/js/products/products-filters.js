// ===== ФИЛЬТРАЦИЯ ТОВАРОВ =====

function applyFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    
    const searchValue = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;
    
    const filteredProducts = AppState.products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchValue);
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    
    displayProducts(filteredProducts);
}

function setupCategoryListener() {
    const categorySelect = document.getElementById('productCategory');
    const expiryGroup = document.getElementById('expiryDateGroup');
    const medicineFields = document.getElementById('medicineFields');
    const coldGroup = document.getElementById('coldGroup'); // Наш новый контейнер из HTML
    const coldCheckbox = document.getElementById('refrigerationRequired');
    
    if (!categorySelect) return;
    
    categorySelect.addEventListener('change', function() {
        // 1. Управление Сроком Годности
        const allowedExpiry = [
            'Продукты', 'Медикаменты', 'Спорт', 'Сад и огород', 
            'Косметика', 'Бытовая химия', 'Замороженные продукты', 
            'Комплектующие ПК', 'Строительные материалы', 'Напитки', 'Зоотовары'
        ];

        if (allowedExpiry.includes(this.value)) {
            if (expiryGroup) expiryGroup.style.display = 'block';
        } else {
            if (expiryGroup) expiryGroup.style.display = 'none';
            const expiryDateInput = document.getElementById('productExpiryDate');
            if (expiryDateInput) expiryDateInput.value = '';
        }
        
        // 2. Управление медицинскими полями (СТРОГО ДЛЯ МЕДИКАМЕНТОВ)
        if (this.value === 'Медикаменты' || this.value === 'Замороженные продукты') {
            if (coldGroup) coldGroup.style.display = 'block';
        } else {
            if (coldGroup) coldGroup.style.display = 'none';
            if (coldCheckbox) coldCheckbox.checked = false;
        }

        // 3. Управление видимостью контейнера Холодильника
        if (this.value === 'Медикаменты' || this.value === 'Замороженные продукты') {
            if (coldGroup) coldGroup.style.display = 'block';
        } else {
            if (coldGroup) coldGroup.style.display = 'none';
            if (coldCheckbox) coldCheckbox.checked = false; // сбрасываем, если выбрали другую категорию
        }
    });
}

window.applyFilters = applyFilters;
window.setupCategoryListener = setupCategoryListener;