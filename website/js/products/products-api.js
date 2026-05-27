// ===== API ВЫЗОВЫ =====

async function loadProducts() {
    try {
        AppState.isLoading = true;
        showStatus('Загрузка товаров...', 'success');
        
        const response = await fetch(APP_CONFIG.API_URL);
        const data = await response.json();
        
        if (data.success) {
            AppState.products = data.data || [];
        } else {
            AppState.products = [];
            showStatus('Ошибка загрузки товаров', 'error');
        }
        
        applyFilters();
        updateStats();
        
        const savedTheme = localStorage.getItem('warehouseTheme') || 'purple';
        if (typeof setTheme === 'function') setTheme(savedTheme);
        
        showStatus(`Загружено ${AppState.products.length} товаров`, 'success');
    } catch (error) {
        console.error(error);
        showStatus('Ошибка подключения к серверу', 'error');
        AppState.products = [];
        displayProducts([]);
    } finally {
        AppState.isLoading = false;
    }
}

async function addNewProduct() {
    if (!AppState.isLoggedIn) {
        showStatus('Войдите в систему', 'error');
        showLoginModal();
        return;
    }
    
    const nameInput = document.getElementById('productName');
    const quantityInput = document.getElementById('productQuantity');
    const categorySelect = document.getElementById('productCategory');
    const priceInput = document.getElementById('productPrice');
    const imageInput = document.getElementById('productImage');
    const descriptionInput = document.getElementById('productDescription');
    const supplierInput = document.getElementById('productSupplier');
    const locationInput = document.getElementById('productLocation');
    
    const name = nameInput.value.trim();
    const quantity = parseInt(quantityInput.value);
    const category = categorySelect.value;
    const price = parseFloat(priceInput.value);
    
    let image = '';
    if (imageInput && imageInput.files[0]) {
        image = await convertImageToBase64(imageInput.files[0]);
    }
    
    const description = descriptionInput ? descriptionInput.value.trim() : '';
    const supplier = supplierInput ? supplierInput.value.trim() : '';
    const location = locationInput ? locationInput.value.trim() : '';
    
    const expiryDateInput = document.getElementById('productExpiryDate');
    const expiryDate = expiryDateInput ? expiryDateInput.value || null : null;
    
    if (!name) {
        showStatus('Введите название', 'error');
        return;
    }
    
    if (isNaN(quantity) || quantity < 1) {
        showStatus('Количество должно быть больше 0', 'error');
        return;
    }
    
    if (isNaN(price) || price < 0) {
        showStatus('Цена не может быть отрицательной', 'error');
        return;
    }
    
    if (isNaN(price) || price < 0) {
        showStatus('Цена не может быть отрицательной', 'error');
        return;
    }
    
    try {
        const coldCheckbox = document.getElementById('refrigerationRequired');
        const currentCategory = categorySelect.value;
        const allowedColdCategories = ['Медикаменты', 'Продукты', 'Замороженные продукты'];

        const refrigerationRequired = allowedColdCategories.includes(currentCategory)
            ? (coldCheckbox ? coldCheckbox.checked : false)
            : false;

        const requestBody = {
            name,
            quantity,
            category: currentCategory,
            price,
            expiryDate,
            refrigerationRequired,
            description,
            supplier,
            location
        };

        // ЕСЛИ ЭТО МЕДИКАМЕНТЫ — добавляем медицинские поля. 
        // Для Замороженных продуктов они НЕ добавятся и отправляться не будут!
        if (currentCategory === 'Медикаменты') {
            requestBody.medicineSeries = document.getElementById('medicineSeries')?.value || '';
            requestBody.medicineManufacturer = document.getElementById('medicineManufacturer')?.value || '';
            requestBody.medicineDosage = document.getElementById('medicineDosage')?.value || '';
            requestBody.medicineType = document.getElementById('medicineType')?.value || '';
            
            const recipeSelect = document.getElementById('medicineRecipe');
            requestBody.prescriptionRequired = recipeSelect?.value === 'По рецепту';
        }

        if (image) {
            requestBody.image = image;
        }
        
        const response = await fetch(APP_CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        
        if (data.success) {
            saveHistory('Добавление товара', `Товар: ${name}\nКоличество: ${quantity}\nКатегория: ${category}\nЦена: ${price} сом`);
            showStatus('Товар добавлен', 'success');
            
            nameInput.value = '';
            quantityInput.value = '1';
            priceInput.value = '0';
            if (expiryDateInput) expiryDateInput.value = '';
            if (imageInput) imageInput.value = '';
            if (descriptionInput) descriptionInput.value = '';
            if (supplierInput) supplierInput.value = '';
            if (locationInput) locationInput.value = '';
            
            const previewWrapper = document.getElementById('imagePreviewWrapper');
            if (previewWrapper) previewWrapper.style.display = 'none';
            
            loadProducts();
        } else {
            showStatus(data.error || 'Ошибка при добавлении товара', 'error');
        }
    } catch (error) {
        console.error(error);
        showStatus('Ошибка сервера: ' + error.message, 'error');
    }
}

async function reduceQuantity(productId, amount) {
    if (!AppState.isLoggedIn) {
        showStatus('Войдите в систему', 'error');
        showLoginModal();
        return;
    }
    
    const product = AppState.products.find(p => p._id === productId);
    const productName = product ? product.name : 'Товар';
    
    try {
        const response = await fetch(`${APP_CONFIG.API_URL}/${productId}/reduce`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: amount })
        });
        
        const data = await response.json();
        
        if (data.success) {
            saveHistory('Списание товара', `Товар: ${productName}\nСписано: ${amount} шт.`);
            showStatus('Товар списан', 'success');
            loadProducts();
        } else {
            showStatus(data.error || 'Ошибка', 'error');
        }
    } catch (error) {
        console.error(error);
        showStatus('Ошибка сервера', 'error');
    }
}

async function deleteProduct(productId) {
    if (!AppState.isLoggedIn) {
        showStatus('Войдите в систему', 'error');
        showLoginModal();
        return;
    }
    
    const product = AppState.products.find(p => p._id === productId);
    const productName = product ? product.name : 'Товар';

    // --- ОПТИМИСТИЧНЫЙ ШАГ: Удаляем товар из локального состояния СРАЗУ ---
    const originalProducts = [...AppState.products]; // Сохраняем копию на случай ошибки
    AppState.products = AppState.products.filter(p => p._id !== productId);
    
    // Сразу обновляем интерфейс, не дожидаясь сервера!
    applyFilters(); 
    updateStats();
    showStatus('Товар удаляется...', 'success');

    try {
        // Отправляем запрос в бэкграунде
        const response = await fetch(`${APP_CONFIG.API_URL}/${productId}`, { method: 'DELETE' });
        const data = await response.json();
        
        if (data.success) {
            saveHistory('Удаление товара', `Товар: ${productName}\nТовар удалён со склада`);
            showStatus('Товар удалён', 'success');
            // loadProducts(); <-- ЭТУ СТРОКУ УДАЛЯЕМ! Нам больше не нужно перекачивать всю базу!
        } else {
            // Если сервер вернул ошибку — возвращаем товар на место
            AppState.products = originalProducts;
            applyFilters();
            updateStats();
            showStatus(data.error || 'Ошибка при удалении', 'error');
        }
    } catch (error) {
        console.error(error);
        // Если легла сеть — тоже возвращаем товар на место
        AppState.products = originalProducts;
        applyFilters();
        updateStats();
        showStatus('Ошибка сервера, товар не удален', 'error');
    }
}

window.loadProducts = loadProducts;
window.addNewProduct = addNewProduct;
window.reduceQuantity = reduceQuantity;
window.deleteProduct = deleteProduct;