// ===== РЕДАКТИРОВАНИЕ ТОВАРА =====

let editingProductId = null;

/* ===== OPEN ===== */

function openEditModal(productId){
    console.log('🔧 openEditModal called with ID:', productId);
    
    // Находим товар
    const product = AppState.products.find(p => p._id === productId);
    if(!product) {
        console.error('Product not found');
        return;
    }
    
    console.log('📦 Editing product:', product.name);
    editingProductId = productId;
    
    // Получаем модальное окно и контент
    const modalOverlay = document.getElementById('editModalOverlay');
    const modalContent = document.getElementById('editModalContent');
    
    if(!modalOverlay || !modalContent) {
        console.error('Modal elements not found!');
        return;
    }
    
    // Заполняем модальное окно HTML-разметкой с данными товара
    modalContent.innerHTML = `
<div class="edit-modal-container">
    <!-- HEADER -->
    <div class="edit-modal-header">
        <div>
            <span class="edit-modal-label">РЕДАКТИРОВАНИЕ ТОВАРА</span>
            <h2 class="edit-modal-title">${escapeHtml(product.name)}</h2>
        </div>
        <button class="edit-close-btn" id="closeEditModalBtn">
            <i class="fas fa-xmark"></i>
        </button>
    </div>

    <!-- BODY -->
    <div class="edit-modal-body">
        <!-- LEFT - Превью изображения -->
        <div class="edit-preview-section">
            <img src="${product.image || 'https://placehold.co/600x400/e2e8f0/475569?text=No+Image'}" 
                 class="edit-preview-image" 
                 id="editPreviewImage"
                 onerror="this.src='https://placehold.co/600x400/e2e8f0/475569?text=No+Image'">
        </div>

        <!-- RIGHT - Форма -->
        <form class="edit-form" id="editForm">
            <div class="edit-section">
                <div class="edit-section-title">Основная информация</div>
                <input type="text" class="form-control" id="editName" value="${escapeHtml(product.name)}" placeholder="Название">
                <textarea class="form-control" id="editDescription" placeholder="Описание">${escapeHtml(product.description || '')}</textarea>
            </div>

            <!-- Категория -->
            <div class="edit-section">
                <div class="edit-section-title">Категория</div>
                <select class="form-control" id="editCategory">
                    <option value="Электроника" ${product.category === 'Электроника' ? 'selected' : ''}>Электроника</option>
                    <option value="Одежда" ${product.category === 'Одежда' ? 'selected' : ''}>Одежда</option>
                    <option value="Продукты" ${product.category === 'Продукты' ? 'selected' : ''}>Продукты</option>
                    <option value="Автозапчасти" ${product.category === 'Автозапчасти' ? 'selected' : ''}>Автозапчасти</option>
                    <option value="Бытовая техника" ${product.category === 'Бытовая техника' ? 'selected' : ''}>Бытовая техника</option>
                    <option value="Освещение" ${product.category === 'Освещение' ? 'selected' : ''}>Освещение</option>
                    <option value="Спорт" ${product.category === 'Спорт' ? 'selected' : ''}>Спорт</option>
                    <option value="Другое" ${product.category === 'Другое' ? 'selected' : ''}>Другое</option>
                </select>
            </div>

            <!-- IMAGE UPLOAD -->
            <div class="edit-section">
                <div class="edit-section-title">Фото товара</div>
                <label class="edit-upload-zone">
                    <input type="file" id="editImage" accept="image/*" hidden>
                    <div class="edit-upload-icon"><i class="fas fa-cloud-arrow-up"></i></div>
                    <div class="edit-upload-title">Перетащите фото товара</div>
                    <div class="edit-upload-subtitle">или нажмите для выбора</div>
                </label>
            </div>

            <!-- GRID - Количество и Цена -->
            <div class="edit-grid">
                <input type="number" class="form-control" id="editQuantity" value="${product.quantity}" placeholder="Количество">
                <input type="number" class="form-control" id="editPrice" value="${product.price}" placeholder="Цена" step="0.01">
            </div>

            <!-- GRID - Поставщик и Склад -->
            <div class="edit-grid">
                <input type="text" class="form-control" id="editSupplier" value="${escapeHtml(product.supplier || '')}" placeholder="Поставщик">
                <input type="text" class="form-control" id="editLocation" value="${escapeHtml(product.location || '')}" placeholder="Склад">
            </div>
            
            <!-- Срок годности -->
            <div class="edit-section">
                <div class="edit-section-title">Срок годности</div>
                <input type="date" class="form-control" id="editExpiryDate" value="${product.expiryDate ? product.expiryDate.split('T')[0] : ''}">
            </div>
        </form>
    </div>

    <!-- FOOTER -->
    <div class="edit-modal-footer">
        <button class="edit-save-btn" id="saveEditBtn">
            <i class="fas fa-check"></i> Сохранить
        </button>
    </div>
</div>
`;

    // Показываем модальное окно
    modalOverlay.classList.add('active');
    
    // === НАВЕШИВАЕМ ОБРАБОТЧИКИ ===
    
    // 1. Закрытие по кнопке
    const closeBtn = document.getElementById('closeEditModalBtn');
    if(closeBtn) {
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.addEventListener('click', closeEditModal);
    }
    
    // 2. Предпросмотр изображения
    const imageInput = document.getElementById('editImage');
    const previewImage = document.getElementById('editPreviewImage');
    if(imageInput) {
        imageInput.addEventListener('change', function(e) {
            if(e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    if(previewImage) previewImage.src = ev.target.result;
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }
    
    // 3. Сохранение
    const saveBtn = document.getElementById('saveEditBtn');
    if(saveBtn) {
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        newSaveBtn.addEventListener('click', saveEditedProduct);
    }
    
    // 4. Закрытие по клику вне окна
    modalOverlay.onclick = function(e) {
        if(e.target === modalOverlay) {
            closeEditModal();
        }
    };
    
    console.log('✅ Modal opened for product:', product.name);
}

/* ===== CLOSE ===== */

function closeEditModal() {
    console.log('🔒 Closing edit modal');
    const modalOverlay = document.getElementById('editModalOverlay');
    if(modalOverlay) {
        modalOverlay.classList.remove('active');
    }
    editingProductId = null;
}

/* ===== SAVE - ОБНОВЛЕННАЯ ВЕРСИЯ ===== */

async function saveEditedProduct() {
    console.log('💾 saveEditedProduct called, editingProductId:', editingProductId);
    
    if(!editingProductId) {
        showStatus('Ошибка: товар не выбран для редактирования', 'error');
        return;
    }
    
    // Получаем значения из полей
    const nameInput = document.getElementById('editName');
    const descInput = document.getElementById('editDescription');
    const categoryInput = document.getElementById('editCategory');
    const quantityInput = document.getElementById('editQuantity');
    const priceInput = document.getElementById('editPrice');
    const supplierInput = document.getElementById('editSupplier');
    const locationInput = document.getElementById('editLocation');
    const expiryDateInput = document.getElementById('editExpiryDate');
    const imageInput = document.getElementById('editImage');
    
    if(!nameInput || !quantityInput || !priceInput) {
        showStatus('Ошибка: не найдены поля формы', 'error');
        return;
    }
    
    // Обработка изображения
    let image = '';
    if(imageInput && imageInput.files && imageInput.files[0]) {
        image = await convertImageToBase64(imageInput.files[0]);
    } else {
        const oldProduct = AppState.products.find(p => p._id === editingProductId);
        image = oldProduct ? (oldProduct.image || '') : '';
    }
    
    const updatedData = {
        name: nameInput.value.trim(),
        description: descInput ? descInput.value.trim() : '',
        category: categoryInput ? categoryInput.value : '',
        quantity: Number(quantityInput.value),
        price: Number(priceInput.value),
        supplier: supplierInput ? supplierInput.value.trim() : '',
        location: locationInput ? locationInput.value.trim() : '',
        expiryDate: expiryDateInput ? expiryDateInput.value || null : null,
        image: image
    };
    
    // Валидация
    if(!updatedData.name) {
        showStatus('Введите название товара', 'error');
        return;
    }
    
    if(isNaN(updatedData.quantity) || updatedData.quantity < 0) {
        showStatus('Количество должно быть положительным числом', 'error');
        return;
    }
    
    if(isNaN(updatedData.price) || updatedData.price < 0) {
        showStatus('Цена не может быть отрицательной', 'error');
        return;
    }
    
    try {
        showStatus('Сохранение...', 'success');
        
        const response = await fetch(APP_CONFIG.API_URL + '/' + editingProductId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
        
        const data = await response.json();
        
        if(data.success) {
            saveHistory('Редактирование товара', 'Товар: ' + updatedData.name);
            closeEditModal();
            await loadProducts();
            showStatus('Товар обновлён', 'success');
        } else {
            showStatus(data.error || 'Ошибка при обновлении товара', 'error');
        }
    } catch(error) {
        console.error(error);
        showStatus('Ошибка сервера: ' + error.message, 'error');
    }
}

// ЭКСПОРТ ФУНКЦИЙ В ГЛОБАЛЬНУЮ ОБЛАСТЬ
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.saveEditedProduct = saveEditedProduct;

console.log('✅ products-edit.js loaded');