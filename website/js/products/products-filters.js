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
    const expiryDateInput = document.getElementById('productExpiryDate');
    const medicineFields = document.getElementById('medicineFields');
    
    if (!categorySelect) return;
    
    // Разрешенные категории для срока годности (Белый список)
    const allowedExpiryCategories = ['Продукты', 'Медикаменты', 'Спорт'];
    
    categorySelect.addEventListener('change', function() {
        const currentCategory = this.value;

        // Блокировка и отображение поля срока годности
        if (allowedExpiryCategories.includes(currentCategory)) {
            if (expiryGroup) expiryGroup.style.display = 'block';
            if (expiryDateInput) expiryDateInput.disabled = false;
        } else {
            if (expiryGroup) expiryGroup.style.display = 'none';
            // Принудительно очищаем и блокируем поле, чтобы дата не отправилась скрытно
            if (expiryDateInput) {
                expiryDateInput.value = '';
                expiryDateInput.disabled = true;
            }
        }
        
        // Отображение дополнительных полей для Медикаментов
        if (currentCategory === 'Медикаменты') {
            if (medicineFields) medicineFields.style.display = 'block';
        } else {
            if (medicineFields) medicineFields.style.display = 'none';
        }
    });
}

window.applyFilters = applyFilters;
window.setupCategoryListener = setupCategoryListener;