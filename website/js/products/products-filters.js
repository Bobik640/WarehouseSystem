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
        
        // 2. Управление медицинскими полями (СЕРИЯ, ДОЗИРОВКА И Т.Д.)
        // ТЕПЕРЬ СТРОГО ДЛЯ МЕДИКАМЕНТОВ
        if (this.value === 'Медикаменты') {
            if (medicineFields) medicineFields.style.display = 'block';
        } else {
            if (medicineFields) medicineFields.style.display = 'none';
        }

        // 3. Управление кнопкой Холодильника (для Медикаментов и Заморозки)
        // Если у вас в HTML чекбокс лежит внутри medicineFields, мы выносим управление его видимостью/активностью отдельно:
        if (this.value === 'Медикаменты' || this.value === 'Замороженные продукты') {
            // Если в вашей верстке чекбокс обернут в отдельный контейнер, 
            // можно показывать его. Если нет — просто делаем его доступным:
            if (coldCheckbox) {
                coldCheckbox.disabled = false;
                // Если у контейнера кнопки холодильника есть свой id (например, 'coldGroup'), 
                // то здесь можно прописать: document.getElementById('coldGroup').style.display = 'block';
            }
        } else {
            if (coldCheckbox) {
                coldCheckbox.checked = false;
                coldCheckbox.disabled = true;
            }
        }
    });
}

window.applyFilters = applyFilters;
window.setupCategoryListener = setupCategoryListener;