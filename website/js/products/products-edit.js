// ===== РЕДАКТИРОВАНИЕ ТОВАРОВ (products-edit.js) =====

let editingProductId = null;

function openEditModal(productId) {
    editingProductId = productId;
    
    // Ищем товар в глобальном состоянии приложения
    const product = AppState.products.find(p => p._id === productId);
    if (!product) {
        if (typeof showStatus === 'function') showStatus('Товар не найден', 'error');
        return;
    }

    // Проверяем контейнер, куда будем пихать разметку модалки
    let modalContainer = document.getElementById('modalContainer');
    if (!modalContainer) {
        // Если контейнера вдруг нет, создадим его в корне body
        modalContainer = document.createElement('div');
        modalContainer.id = 'modalContainer';
        document.body.appendChild(modalContainer);
    }

    // Ищем саму модалку, если её нет — рендерим в DOM
    let modalOverlay = document.getElementById('editProductModalOverlay');
    if (!modalOverlay) {
        injectEditModalMarkup();
        modalOverlay = document.getElementById('editProductModalOverlay');
    }

    // Заполняем поля данными
    document.getElementById('editProductName').value = product.name || '';
    document.getElementById('editProductDescription').value = product.description || '';
    document.getElementById('editProductCategory').value = product.category || 'Электроника';
    document.getElementById('editProductQuantity').value = product.quantity || 0;
    document.getElementById('editProductMinStock').value = product.minStock || 5;
    document.getElementById('editProductPrice').value = product.price || 0;
    document.getElementById('editProductSupplier').value = product.supplier || '';
    document.getElementById('editProductLocation').value = product.location || '';
    
    if (product.expiryDate) {
        document.getElementById('editProductExpiryDate').value = product.expiryDate.substring(0, 10);
    } else {
        document.getElementById('editProductExpiryDate').value = '';
    }

    // Селекторы для логики отображения
    const previewImg = document.getElementById('editImagePreview');
    const medFields = document.getElementById('editMedicineFields');

    // Настраиваем превью картинки
    if (product.image) {
        previewImg.src = product.image;
        previewImg.style.display = 'block';
    } else {
        previewImg.src = '';
        previewImg.style.display = 'none';
    }

    // Проверяем категорию "Медикаменты"
    if (product.category === 'Медикаменты') {
        medFields.style.display = 'flex'; // У тебя в CSS под него заточен flex-direction: column
        document.getElementById('editMedicineSeries').value = product.medicineSeries || '';
        document.getElementById('editMedicineManufacturer').value = product.medicineManufacturer || '';
        document.getElementById('editMedicineDosage').value = product.medicineDosage || '';
        document.getElementById('editMedicineType').value = product.medicineType || 'Таблетки';
        document.getElementById('editPrescriptionRequired').value = String(product.prescriptionRequired || false);
        document.getElementById('editRefrigerationRequired').checked = !!product.refrigerationRequired;
    } else {
        medFields.style.display = 'none';
    }

    // Включаем модалку (появится благодаря добавленному CSS правилу .active)
    modalOverlay.classList.add('active');
}

function closeEditModal() {
    const modalOverlay = document.getElementById('editProductModalOverlay');
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
    }
    editingProductId = null;
}

async function saveProductEdit() {
    if (!editingProductId) return;

    const saveBtn = document.getElementById('saveEditBtn');
    const product = AppState.products.find(p => p._id === editingProductId);
    if (!product) return;

    const category = document.getElementById('editProductCategory').value;
    
    const updatedData = {
        ...product,
        name: document.getElementById('editProductName').value.trim(),
        description: document.getElementById('editProductDescription').value.trim(),
        category: category,
        quantity: Number(document.getElementById('editProductQuantity').value),
        minStock: Number(document.getElementById('editProductMinStock').value),
        price: Number(document.getElementById('editProductPrice').value),
        supplier: document.getElementById('editProductSupplier').value.trim(),
        location: document.getElementById('editProductLocation').value.trim(),
        expiryDate: document.getElementById('editProductExpiryDate').value || null,
        image: document.getElementById('editImagePreview').src || product.image 
    };

    if (!updatedData.name) {
        if (typeof showStatus === 'function') showStatus('Укажите название товара', 'error');
        return;
    }

    if (category === 'Медикаменты') {
        updatedData.medicineSeries = document.getElementById('editMedicineSeries').value.trim();
        updatedData.medicineManufacturer = document.getElementById('editMedicineManufacturer').value.trim();
        updatedData.medicineDosage = document.getElementById('editMedicineDosage').value.trim();
        updatedData.medicineType = document.getElementById('editMedicineType').value;
        updatedData.prescriptionRequired = document.getElementById('editPrescriptionRequired').value === 'true';
        updatedData.refrigerationRequired = document.getElementById('editRefrigerationRequired').checked;
    } else {
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
            saveBtn.innerHTML = 'Сохранение...';
        }

        const response = await fetch(`${APP_CONFIG.API_URL}/${editingProductId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        const data = await response.json();

        if (data.success) {
            if (typeof saveHistory === 'function') saveHistory('Редактирование', `Обновлен товар: ${updatedData.name}`);
            if (typeof showStatus === 'function') showStatus('Успешно обновлено', 'success');
            closeEditModal();
            if (typeof loadProducts === 'function') loadProducts();
        } else {
            if (typeof showStatus === 'function') showStatus(data.error || 'Ошибка', 'error');
        }
    } catch (error) {
        console.error(error);
        if (typeof showStatus === 'function') showStatus('Ошибка сервера', 'error');
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Сохранить изменения';
        }
    }
}

function injectEditModalMarkup() {
    const container = document.getElementById('modalContainer');
    if (!container) return;

    // Вставляем структуру, жестко завязанную на твои CSS-классы
    container.innerHTML = `
        <div class="edit-modal-overlay" id="editProductModalOverlay">
            <div class="edit-modal">
                <div class="edit-modal-container">
                    
                    <div class="edit-modal-header">
                        <div>
                            <div class="edit-modal-label">ИНВЕНТАРИЗАЦИЯ</div>
                            <h2 class="edit-modal-title">Редактирование</h2>
                        </div>
                        <button class="edit-close-btn" id="closeEditModalBtn">✕</button>
                    </div>

                    <div class="edit-modal-body">
                        
                        <div class="edit-section">
                            <div class="edit-section-title">ИЗОБРАЖЕНИЕ</div>
                            <img id="editImagePreview" class="edit-preview-image" src="" alt="Превью" style="display: none;">
                            <div class="edit-upload-zone" id="editUploadZone">
                                <div class="edit-upload-icon">↑</div>
                                <div class="edit-upload-title">Новое фото</div>
                                <div class="edit-upload-subtitle">Кликните или перетащите</div>
                            </div>
                        </div>

                        <div class="edit-form">
                            
                            <div class="edit-section">
                                <div class="edit-section-title">Основное</div>
                                <div class="edit-grid">
                                    <div>
                                        <div class="edit-modal-label">НАЗВАНИЕ ТОВАРА</div>
                                        <input type="text" id="editProductName" style="width:100%; padding:10px; border-radius:10px; background:#1e293b; border:1px solid #334155; color:white;">
                                    </div>
                                    <div>
                                        <div class="edit-modal-label">КАТЕГОРИЯ</div>
                                        <select id="editProductCategory" style="width:100%; padding:10px; border-radius:10px; background:#1e293b; border:1px solid #334155; color:white;">
                                            <option value="Электроника">Электроника</option>
                                            <option value="Медикаменты">Медикаменты</option>
                                            <option value="Инструменты">Инструменты</option>
                                            <option value="Другое">Другое</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <div class="edit-modal-label">ОПИСАНИЕ ТОВАРА</div>
                                    <textarea id="editProductDescription" rows="2" style="width:100%; padding:10px; border-radius:10px; background:#1e293b; border:1px solid #334155; color:white; resize:none;"></textarea>
                                </div>
                            </div>

                            <div class="edit-section">
                                <div class="edit-section-title">Параметры склада</div>
                                <div class="edit-grid">
                                    <div>
                                        <div class="edit-modal-label">КОЛИЧЕСТВО</div>
                                        <input type="number" id="editProductQuantity" style="width:100%; padding:10px; border-radius:10px; background:#1e293b; border:1px solid #334155; color:white;">
                                    </div>
                                    <div>
                                        <div class="edit-modal-label">МИНИМАЛЬНЫЙ ЗАПАС</div>
                                        <input type="number" id="editProductMinStock" style="width:100%; padding:10px; border-radius:10px; background:#1e293b; border:1px solid #334155; color:white;">
                                    </div>
                                    <div>
                                        <div class="edit-modal-label">ЦЕНА (СОМ)</div>
                                        <input type="number" id="editProductPrice" step="0.01" style="width:100%; padding:10px; border-radius:10px; background:#1e293b; border:1px solid #334155; color:white;">
                                    </div>
                                    <div>
                                        <div class="edit-modal-label">СРОК ГОДНОСТИ</div>
                                        <input type="date" id="editProductExpiryDate" style="width:100%; padding:10px; border-radius:10px; background:#1e293b; border:1px solid #334155; color:white;">
                                    </div>
                                </div>
                                <div class="edit-grid">
                                    <div>
                                        <div class="edit-modal-label">ПОСТАВЩИК</div>
                                        <input type="text" id="editProductSupplier" style="width:100%; padding:10px; border-radius:10px; background:#1e293b; border:1px solid #334155; color:white;">
                                    </div>
                                    <div>
                                        <div class="edit-modal-label">МЕСТО ХРАНЕНИЯ</div>
                                        <input type="text" id="editProductLocation" style="width:100%; padding:10px; border-radius:10px; background:#1e293b; border:1px solid #334155; color:white;">
                                    </div>
                                </div>
                            </div>

                            <div class="edit-medicine-fields" id="editMedicineFields">
                                <div class="edit-section-title">Медицинский учет</div>
                                <div class="edit-grid">
                                    <div>
                                        <div class="edit-modal-label">СЕРИЯ</div>
                                        <input type="text" id="editMedicineSeries" style="width:100%; padding:10px; border-radius:10px; background:#1e293b; border:1px solid #334155; color:white;">
                                    </div>
                                    <div>
                                        <div class="edit-modal-label">ПРОИЗВОДИТЕЛЬ</div>
                                        <input type="text" id="editMedicineManufacturer" style="width:100%; padding:10px; border-radius:10px; background:#1e293b; border:1px solid #334155; color:white;">
                                    </div>
                                    <div>
                                        <div class="edit-modal-label">ДОЗИРОВКА</div>
                                        <input type="text" id="editMedicineDosage" style="width:100%; padding:10px; border-radius:10px; background:#1e293b; border:1px solid #334155; color:white;">
                                    </div>
                                    <div>
                                        <div class="edit-modal-label">ФОРМА ВЫПУСКА</div>
                                        <select id="editMedicineType" style="width:100%; padding:10px; border-radius:10px; background:#1e293b; border:1px solid #334155; color:white;">
                                            <option>Таблетки</option><option>Сироп</option><option>Ампулы</option><option>Капсулы</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="edit-grid" style="align-items: center;">
                                    <div>
                                        <div class="edit-modal-label">УСЛОВИЯ ОТПУСКА</div>
                                        <select id="editPrescriptionRequired" style="width:100%; padding:10px; border-radius:10px; background:#1e293b; border:1px solid #334155; color:white;">
                                            <option value="false">Без рецепта</option>
                                            <option value="true">По рецепту</option>
                                        </select>
                                    </div>
                                    <label class="edit-fridge-toggle" style="user-select: none;">
                                        <input type="checkbox" id="editRefrigerationRequired">
                                        <div class="edit-fridge-slider"></div>
                                        <span class="edit-modal-label" style="letter-spacing:0; color:white;">ХОЛОДИЛЬНИК</span>
                                    </label>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div class="edit-modal-footer">
                        <button class="edit-save-btn" id="saveEditBtn">
                            <i class="fas fa-save"></i> Сохранить изменения
                        </button>
                    </div>

                </div>
            </div>
        </div>
    `;

    // Слушатель на селект категории внутри модалки
    document.getElementById('editProductCategory').addEventListener('change', (e) => {
        const medFields = document.getElementById('editMedicineFields');
        medFields.style.display = e.target.value === 'Медикаменты' ? 'flex' : 'none';
    });

    // Слушатели закрытия и сохранения
    document.getElementById('closeEditModalBtn').addEventListener('click', closeEditModal);
    document.getElementById('saveEditBtn').addEventListener('click', saveProductEdit);
}

// Экспортируем функции наружу
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.saveProductEdit = saveProductEdit;