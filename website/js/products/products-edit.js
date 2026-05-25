// ===== РЕДАКТИРОВАНИЕ ТОВАРОВ (products-edit.js) =====

let editingProductId = null;

/**
 * Открывает модальное окно редактирования и заполняет его данными товара
 * @param {string} productId - ID товара из базы MongoDB
 */
function openEditModal(productId) {
    editingProductId = productId;
    
    const product = AppState.products.find(p => p._id === productId);
    if (!product) {
        showStatus('Товар для редактирования не найден', 'error');
        return;
    }

    // Ищем или динамически создаем контейнер модалки редактирования в #modalContainer
    let modalOverlay = document.getElementById('editProductModalOverlay');
    
    if (!modalOverlay) {
        injectEditModalMarkup();
        modalOverlay = document.getElementById('editProductModalOverlay');
    }

    // Заполняем базовые поля формы данными товара
    document.getElementById('editProductName').value = product.name || '';
    document.getElementById('editProductDescription').value = product.description || '';
    document.getElementById('editProductCategory').value = product.category || 'Электроника';
    document.getElementById('editProductQuantity').value = product.quantity || 0;
    document.getElementById('editProductMinStock').value = product.minStock || 5;
    document.getElementById('editProductPrice').value = product.price || 0;
    document.getElementById('editProductSupplier').value = product.supplier || '';
    document.getElementById('editProductLocation').value = product.location || '';
    document.getElementById('editProductExpiryDate').value = product.expiryDate ? product.expiryDate.substring(0, 10) : '';

    // Обработка превью картинки
    const previewImg = document.getElementById('editImagePreview');
    if (product.image) {
        previewImg.src = product.image;
        previewImg.style.display = 'block';
    } else {
        previewImg.src = '';
        previewImg.style.display = 'none';
    }

    // Специфичные поля для Медикаментов
    const medFields = document.getElementById('editMedicineFields');
    if (product.category === 'Медикаменты') {
        if (medFields) medFields.style.display = 'block';
        document.getElementById('editMedicineSeries').value = product.medicineSeries || '';
        document.getElementById('editMedicineManufacturer').value = product.medicineManufacturer || '';
        document.getElementById('editMedicineDosage').value = product.medicineDosage || '';
        document.getElementById('editMedicineType').value = product.medicineType || 'Таблетки';
        document.getElementById('editPrescriptionRequired').value = String(product.prescriptionRequired || false);
        document.getElementById('editRefrigerationRequired').checked = !!product.refrigerationRequired;
    } else {
        if (medFields) medFields.style.display = 'none';
    }

    // Логика переключения мед-полей при изменении категории ВНУТРИ модалки редактирования
    document.getElementById('editProductCategory').addEventListener('change', (e) => {
        if (medFields) {
            medFields.style.display = e.target.value === 'Медикаменты' ? 'block' : 'none';
        }
    });

    // Показываем модалку
    modalOverlay.classList.add('active');
}

/**
 * Закрывает модальное окно редактирования
 */
function closeEditModal() {
    const modalOverlay = document.getElementById('editProductModalOverlay');
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
    }
    editingProductId = null;
}

/**
 * Собирает измененные данные и отправляет на сервер
 */
async function saveProductEdit() {
    if (!editingProductId) return;

    const saveBtn = document.getElementById('saveEditBtn');
    const product = AppState.products.find(p => p._id === editingProductId);
    if (!product) return;

    // Собираем базовые измененные данные
    const category = document.getElementById('editProductCategory').value;
    
    const updatedData = {
        ...product, // Сохраняем скрытые системные поля (например, дату создания)
        name: document.getElementById('editProductName').value.trim(),
        description: document.getElementById('editProductDescription').value.trim(),
        category: category,
        quantity: Number(document.getElementById('editProductQuantity').value),
        minStock: Number(document.getElementById('editProductMinStock').value),
        price: Number(document.getElementById('editProductPrice').value),
        supplier: document.getElementById('editProductSupplier').value.trim(),
        location: document.getElementById('editProductLocation').value.trim(),
        expiryDate: document.getElementById('editProductExpiryDate').value || null,
        // Сюда можно прикрутить base64 строку картинки, если она менялась в upload-zone
        image: document.getElementById('editImagePreview').src || product.image 
    };

    // Валидация базовых полей
    if (!updatedData.name) {
        showStatus('Название товара не может быть пустым', 'error');
        return;
    }

    // Если это медикаменты — собираем медицинские свойства
    if (category === 'Медикаменты') {
        updatedData.medicineSeries = document.getElementById('editMedicineSeries').value.trim();
        updatedData.medicineManufacturer = document.getElementById('editMedicineManufacturer').value.trim();
        updatedData.medicineDosage = document.getElementById('editMedicineDosage').value.trim();
        updatedData.medicineType = document.getElementById('editMedicineType').value;
        updatedData.prescriptionRequired = document.getElementById('editPrescriptionRequired').value === 'true';
        updatedData.refrigerationRequired = document.getElementById('editRefrigerationRequired').checked;
    } else {
        // Очищаем медицинские поля, если категорию сменили на другую
        updatedData.medicineSeries = '';
        updatedData.medicineManufacturer = '';
        updatedData.medicineDosage = '';
        updatedData.medicineType = 'Таблетки';
        updatedData.prescriptionRequired = false;
        updatedData.refrigerationRequired = false;
    }

    try {
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';
        }

        // Отправка запроса на бэкенд Express/MongoDB
        const response = await fetch(`${APP_CONFIG.API_URL}/${editingProductId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        const data = await response.json();

        if (data.success) {
            if (typeof saveHistory === 'function') {
                saveHistory('Редактирование', `Обновлены данные товара: ${updatedData.name}`);
            }
            showStatus('Товар успешно обновлен', 'success');
            closeEditModal();
            
            if (typeof loadProducts === 'function') {
                loadProducts(); // Перезагружаем список товаров на главной
            }
        } else {
            showStatus(data.error || 'Ошибка при сохранении', 'error');
        }
    } catch (error) {
        console.error(error);
        showStatus('Ошибка соединения с сервером', 'error');
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Сохранить изменения';
        }
    }
}

/**
 * Генерирует структуру HTML-модалки внутри #modalContainer, если её нет при старте
 */
function injectEditModalMarkup() {
    const container = document.getElementById('modalContainer');
    if (!container) return;

    const modalHtml = `
        <div class="edit-modal-overlay" id="editProductModalOverlay">
            <div class="edit-modal-window">
                <div class="edit-modal-header">
                    <h2><i class="fas fa-edit"></i> Редактирование товара</h2>
                    <button class="edit-modal-close-btn" id="closeEditModalBtn"><i class="fas fa-xmark"></i></button>
                </div>
                <div class="edit-modal-body">
                    <div class="form-group">
                        <label>Название товара</label>
                        <input type="text" id="editProductName" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Описание</label>
                        <textarea id="editProductDescription" class="form-control" rows="2"></textarea>
                    </div>
                    <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div class="form-group">
                            <label>Категория</label>
                            <select id="editProductCategory" class="form-control">
                                ${document.getElementById('productCategory') ? document.getElementById('productCategory').innerHTML : '<option value="Электроника">Электроника</option><option value="Медикаменты">Медикаменты</option>'}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Цена (сом)</label>
                            <input type="number" id="editProductPrice" class="form-control" step="0.01">
                        </div>
                        <div class="form-group">
                            <label>Количество</label>
                            <input type="number" id="editProductQuantity" class="form-control">
                        </div>
                        <div class="form-group">
                            <label>Мин. остаток</label>
                            <input type="number" id="editProductMinStock" class="form-control">
                        </div>
                        <div class="form-group">
                            <label>Поставщик</label>
                            <input type="text" id="editProductSupplier" class="form-control">
                        </div>
                        <div class="form-group">
                            <label>Местоположение</label>
                            <input type="text" id="editProductLocation" class="form-control">
                        </div>
                    </div>

                    <div id="editMedicineFields" style="display:none; border-left: 3px solid var(--accent-color, #a855f7); padding-left: 10px; margin-top: 15px;">
                        <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div class="form-group">
                                <label>Серия</label>
                                <input type="text" id="editMedicineSeries" class="form-control">
                            </div>
                            <div class="form-group">
                                <label>Производитель</label>
                                <input type="text" id="editMedicineManufacturer" class="form-control">
                            </div>
                            <div class="form-group">
                                <label>Дозировка</label>
                                <input type="text" id="editMedicineDosage" class="form-control">
                            </div>
                            <div class="form-group">
                                <label>Тип</label>
                                <select id="editMedicineType" class="form-control">
                                    <option>Таблетки</option><option>Сироп</option><option>Ампулы</option><option>Капсулы</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group" style="margin-top:10px;">
                            <label>Рецептурный</label>
                            <select id="editPrescriptionRequired" class="form-control">
                                <option value="false">Без рецепта</option>
                                <option value="true">По рецепту</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-top:10px;">
                            <label><input type="checkbox" id="editRefrigerationRequired"> 0❄ Требует холодильник</label>
                        </div>
                    </div>

                    <div class="form-group" style="margin-top: 15px;">
                        <label>Срок годности</label>
                        <input type="date" id="editProductExpiryDate" class="form-control">
                    </div>

                    <div class="form-group" style="margin-top: 15px;">
                        <label>Превью изображения</label>
                        <img id="editImagePreview" style="max-width: 100%; max-height: 120px; border-radius: 8px; margin-top: 5px; object-fit: cover;">
                    </div>
                </div>
                <div class="edit-modal-footer" style="display:flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                    <button class="btn btn-secondary" id="closeEditModalCancelBtn">Отмена</button>
                    <button class="btn btn-primary" id="saveEditBtn"><i class="fas fa-save"></i> Сохранить изменения</button>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', modalHtml);

    // Вешаем слушатели на закрытие модалки
    document.getElementById('closeEditModalBtn').addEventListener('click', closeEditModal);
    document.getElementById('closeEditModalCancelBtn').addEventListener('click', closeEditModal);
    document.getElementById('saveEditBtn').addEventListener('click', saveProductEdit);
}

// Экспортируем в глобальную видимость для вызова из карточек товара
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.saveProductEdit = saveProductEdit;