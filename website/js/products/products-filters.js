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
    
    if (!categorySelect) return;
    
    categorySelect.addEventListener('change', function() {
        if (this.value === 'Продукты' || this.value === 'Медикаменты') {
            if (expiryGroup) expiryGroup.style.display = 'block';
        } else {
            if (expiryGroup) expiryGroup.style.display = 'none';
            // Дополнительно: сбрасываем дату срока годности, если скрыли её
            const expiryDateInput = document.getElementById('productExpiryDate');
            if (expiryDateInput) expiryDateInput.value = '';
        }
        
        if (this.value === 'Медикаменты') {
            if (medicineFields) medicineFields.style.display = 'block';
        } else {
            if (medicineFields) medicineFields.style.display = 'none';
            
            // ЧИТОК: Находим чекбокс холодильника внутри скрываемого блока и выключаем его
            const coldCheckbox = document.getElementById('refrigerationRequired');
            if (coldCheckbox) {
                coldCheckbox.checked = false;
            }
        }
    });
}

window.applyFilters = applyFilters;
window.setupCategoryListener = setupCategoryListener;