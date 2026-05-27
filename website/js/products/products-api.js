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
    
    // Обработка изображения (если есть)
    let image = '';
    if (imageInput && imageInput.files && imageInput.files[0]) {
        image = await convertImageToBase64(imageInput.files[0]);
    }
    if (!image && window.uploadedImageUrl) {
        image = window.uploadedImageUrl;
    }
    
    const description = descriptionInput ? descriptionInput.value.trim() : '';
    const supplier = supplierInput ? supplierInput.value.trim() : '';
    const location = locationInput ? locationInput.value.trim() : '';
    
    const expiryDateInput = document.getElementById('productExpiryDate');
    const expiryDate = expiryDateInput ? expiryDateInput.value || null : null;
    
    // Валидация
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
    
    try {
        // Сбор медицинских полей
        const medicineSeries = document.getElementById('medicineSeries')?.value || '';
        const medicineManufacturer = document.getElementById('medicineManufacturer')?.value || '';
        const medicineDosage = document.getElementById('medicineDosage')?.value || '';
        const medicineType = document.getElementById('medicineType')?.value || '';
        const prescriptionRequired = document.getElementById('medicineRecipe')?.value === 'По рецепту';
        
        // [ИСПРАВЛЕНО]: Переводим в нижний регистр и убираем пробелы, чтобы проверка всегда срабатывала корректно
        const currentCategoryClean = category.trim().toLowerCase();
        let refrigerationRequired = false;
        
        if (currentCategoryClean === 'медикаменты') {
            const needsColdCheck = document.getElementById('needsCold');
            refrigerationRequired = needsColdCheck ? needsColdCheck.checked === true : false;
        }
        
        const requestBody = {
            name,
            quantity,
            category,
            price,
            expiryDate,
            refrigerationRequired,
            description,
            supplier,
            location,
            medicineSeries,
            medicineManufacturer,
            medicineDosage,
            medicineType,
            prescriptionRequired
        };
        
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
            
            // Очистка формы
            nameInput.value = '';
            quantityInput.value = '1';
            priceInput.value = '0';
            if (expiryDateInput) expiryDateInput.value = '';
            if (imageInput) imageInput.value = '';
            if (descriptionInput) descriptionInput.value = '';
            if (supplierInput) supplierInput.value = '';
            if (locationInput) locationInput.value = '';
            
            // Очистка медицинских полей
            const medicineSeriesInput = document.getElementById('medicineSeries');
            const medicineManufacturerInput = document.getElementById('medicineManufacturer');
            const medicineDosageInput = document.getElementById('medicineDosage');
            const medicineTypeSelect = document.getElementById('medicineType');
            const medicineRecipeSelect = document.getElementById('medicineRecipe');
            const needsColdCheck = document.getElementById('needsCold');
            
            if (medicineSeriesInput) medicineSeriesInput.value = '';
            if (medicineManufacturerInput) medicineManufacturerInput.value = '';
            if (medicineDosageInput) medicineDosageInput.value = '';
            if (medicineTypeSelect) medicineTypeSelect.value = '';
            if (medicineRecipeSelect) medicineRecipeSelect.value = 'Без рецепта';
            if (needsColdCheck) needsColdCheck.checked = false;
            
            if (window.uploadedImageUrl) {
                window.uploadedImageUrl = '';
            }
            
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
    
    try {
        const response = await fetch(`${APP_CONFIG.API_URL}/${productId}`, { method: 'DELETE' });
        const data = await response.json();
        
        if (data.success) {
            saveHistory('Удаление товара', `Товар: ${productName}\nТовар удалён со склада`);
            showStatus('Товар удалён', 'success');
            loadProducts();
        } else {
            showStatus(data.error || 'Ошибка', 'error');
        }
    } catch (error) {
        console.error(error);
        showStatus('Ошибка сервера', 'error');
    }
}

window.loadProducts = loadProducts;
window.addNewProduct = addNewProduct;
window.reduceQuantity = reduceQuantity;
window.deleteProduct = deleteProduct;