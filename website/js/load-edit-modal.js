async function loadEditModal() {
    try {
        const response = await fetch('components/edit-modal.html');
        const html = await response.text();

        const container = document.getElementById('editModalContainer');

        if (container) {
            container.innerHTML = html;
        }

        setTimeout(() => {

    initEditModal();
    initMedicineFields();
    initEditUpload();

}, 0);

    } catch (error) {
        console.error('Ошибка загрузки modal:', error);
    }
}

function initEditModal() {
    const closeBtn = document.getElementById('closeEditModalBtn');
    const saveBtn = document.getElementById('saveEditBtn');
    const overlay = document.getElementById('editModalOverlay');

    if (closeBtn) {
        closeBtn.onclick = closeEditModal;
    }

    if (saveBtn) {
        saveBtn.onclick = saveEditedProduct;
    }

    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target.id === 'editModalOverlay') {
                closeEditModal();
            }
        });
    }
}

function initMedicineFields() {
    const categorySelect = document.getElementById('editCategory');
    const medicineFields = document.getElementById('editMedicineFields');
    const expiryGroup = document.getElementById('editExpiryDateGroup');

    if (!categorySelect) return;

    categorySelect.addEventListener('change', function() {
        if (this.value === 'Медикаменты' || this.value === 'Продукты') {
            if (expiryGroup) expiryGroup.style.display = 'block';
        } else {
            if (expiryGroup) expiryGroup.style.display = 'none';
            const expiryInput = document.getElementById('editExpiryDate');
            if (expiryInput) expiryInput.value = '';
        }

        if (this.value === 'Медикаменты') {
            if (medicineFields) medicineFields.style.display = 'block';
        } else {
            if (medicineFields) medicineFields.style.display = 'none';
        }
    });
}

function openEditModal(productId) {
    const product = AppState.products.find(p => p._id === productId);
    if (!product) {
        showStatus('Товар не найден', 'error');
        return;
    }

    AppState.editingProductId = productId;

    const overlay = document.getElementById('editModalOverlay');
    if (overlay) overlay.classList.add('active');

    // Заполнение базовых полей
    if (document.getElementById('editModalTitle')) {
        document.getElementById('editModalTitle').textContent = product.name;
    }
    if (document.getElementById('editName')) {
        document.getElementById('editName').value = product.name;
    }
    if (document.getElementById('editQuantity')) {
        document.getElementById('editQuantity').value = product.quantity;
    }
    if (document.getElementById('editPrice')) {
        document.getElementById('editPrice').value = product.price;
    }
    if (document.getElementById('editDescription')) {
        document.getElementById('editDescription').value = product.description || '';
    }
    if (document.getElementById('editSupplier')) {
        document.getElementById('editSupplier').value = product.supplier || '';
    }
    if (document.getElementById('editLocation')) {
        document.getElementById('editLocation').value = product.location || '';
    }

    const categorySelect = document.getElementById('editCategory');
    if (categorySelect) {
        categorySelect.value = product.category;
    }

    // Обработка превью изображения
    const previewImage = document.getElementById('editPreviewImage');
    if (previewImage) {
        previewImage.src = product.image || 'https://placehold.co/600x400/e2e8f0/475569?text=No+Image';
    }
    AppState.editImageBase64 = product.image || '';

    // Находим блоки UI для специфичных полей
    const expiryGroup = document.getElementById('editExpiryDateGroup');
    const medicineFields = document.getElementById('editMedicineFields'); // <-- ОБЪЯВИЛИ ПЕРЕМЕННУЮ ЗДЕСЬ

    // Управление блоком Срока Годности (для Медикаментов и Продуктов)
    if (product.category === 'Медикаменты' || product.category === 'Продукты') {
        if (expiryGroup) expiryGroup.style.display = 'block';
        const expiryInput = document.getElementById('editExpiryDate');
        if (expiryInput && product.expiryDate) {
            expiryInput.value = product.expiryDate.split('T')[0];
        }
    } else {
        if (expiryGroup) expiryGroup.style.display = 'none';
        const expiryInput = document.getElementById('editExpiryDate');
        if (expiryInput) expiryInput.value = '';
    }

    // Управление блоком Медикаментов (СТРОГО для Медикаментов)
    if (product.category === 'Медикаменты') {
        if (medicineFields) medicineFields.style.display = 'block';
        
        if (document.getElementById('editMedicineManufacturer')) {
            document.getElementById('editMedicineManufacturer').value = product.medicineManufacturer || '';
        }
        if (document.getElementById('editMedicineDosage')) {
            document.getElementById('editMedicineDosage').value = product.medicineDosage || '';
        }
        if (document.getElementById('editMedicineType')) {
            document.getElementById('editMedicineType').value = product.medicineType || '';
        }
        
        const recipeSelect = document.getElementById('editMedicineRecipe');
        if (recipeSelect) {
            recipeSelect.value = product.prescriptionRequired ? 'По рецепту' : 'Без рецепта';
        }
    } else {
        if (medicineFields) medicineFields.style.display = 'none';
    }
}

function initEditUpload() {
    const uploadZone = document.getElementById('editUploadZone');
    const fileInput = document.getElementById('editImage');
    const preview = document.getElementById('editPreviewImage');

    if (!uploadZone || !fileInput || !preview) return;

    uploadZone.onclick = () => {
        fileInput.click();
    };

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');

        const file = e.dataTransfer.files[0];

        if (file && file.type.startsWith('image/')) {
            fileInput.files = e.dataTransfer.files;
            updatePreview(file);
        }
    });

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) {
            updatePreview(file);
        }
    });
}

function updatePreview(file) {
    const reader = new FileReader();
    const preview = document.getElementById('editPreviewImage');

    reader.onload = function(event) {
        if (preview) {
            preview.src = event.target.result;
        }
    };

    reader.readAsDataURL(file);
}

// ===== ФУНКЦИЯ ОТКРЫТИЯ МОДАЛКИ =====
function openEditModal(productId) {
    const product = AppState.products.find(p => p._id === productId);
    if (!product) return;

    AppState.editingProductId = productId;

    // Основные поля
    const titleEl = document.getElementById('editModalTitle');
    const nameEl = document.getElementById('editName');
    const descEl = document.getElementById('editDescription');
    const qtyEl = document.getElementById('editQuantity');
    const priceEl = document.getElementById('editPrice');
    const supplierEl = document.getElementById('editSupplier');
    const locationEl = document.getElementById('editLocation');
    const categoryEl = document.getElementById('editCategory');
    const previewEl = document.getElementById('editPreviewImage');
    const overlay = document.getElementById('editModalOverlay');

    if (titleEl) titleEl.textContent = product.name;
    if (nameEl) nameEl.value = product.name || '';
    if (descEl) descEl.value = product.description || '';
    if (qtyEl) qtyEl.value = product.quantity || 0;
    if (priceEl) priceEl.value = product.price || 0;
    if (supplierEl) supplierEl.value = product.supplier || '';
    if (locationEl) locationEl.value = product.location || '';
    if (categoryEl) categoryEl.value = product.category || '';
    if (previewEl) previewEl.src = product.image || '';

    // ===== МЕДИЦИНСКИЕ ПОЛЯ =====
    const medicineFields = document.getElementById('editMedicineFields');
    const isMedicine = product.category?.trim()?.toLowerCase() === 'медикаменты';

    // Показываем/скрываем блок с медицинскими полями
    if (medicineFields) {
        medicineFields.style.display = isMedicine ? 'flex' : 'none';
    }

    // [ИСПРАВЛЕНО]: Чекбокс холодильника и дата считываются ВСЕГДА, независимо от категории
    const needsColdCheck = document.getElementById('editNeedsCold');
    const expiryDate = document.getElementById('editExpiryDate');

    if (needsColdCheck) {
        needsColdCheck.checked = product.refrigerationRequired === true;
    }
    if (expiryDate) {
        expiryDate.value = product.expiryDate
            ? new Date(product.expiryDate).toISOString().split('T')[0]
            : '';
    }

    // Заполняем остальные специфичные медицинские поля, только если товар - медикамент
    if (isMedicine) {
        const seriesInput = document.getElementById('editMedicineSeries');
        const manufacturerInput = document.getElementById('editMedicineManufacturer');
        const dosageInput = document.getElementById('editMedicineDosage');
        const typeSelect = document.getElementById('editMedicineType');
        const recipeSelect = document.getElementById('editMedicineRecipe');

        if (seriesInput) seriesInput.value = product.medicineSeries || '';
        if (manufacturerInput) manufacturerInput.value = product.medicineManufacturer || '';
        if (dosageInput) dosageInput.value = product.medicineDosage || '';
        if (typeSelect) typeSelect.value = product.medicineType || 'Таблетки';
        
        // Преобразуем boolean в текст для select
        const recipeValue = product.prescriptionRequired === true ? 'По рецепту' : 'Без рецепта';
        if (recipeSelect) recipeSelect.value = recipeValue;
    }

    const saveBtn = document.getElementById('saveEditBtn');
    if (saveBtn) {
        saveBtn.onclick = saveEditedProduct;
    }

    if (overlay) overlay.style.display = 'flex';
}

// ===== ФУНКЦИЯ ЗАКРЫТИЯ МОДАЛКИ =====
function closeEditModal() {
    const overlay = document.getElementById('editModalOverlay');
    if (overlay) overlay.style.display = 'none';
    AppState.editingProductId = null;
}

async function saveEditedProduct() {

    if (!AppState.editingProductId) return;

    const oldProduct = AppState.products.find(
        p => p._id === AppState.editingProductId
    );

    if (!oldProduct) return;

    let image = oldProduct.image || '';

    const imageInput = document.getElementById('editImage');

    if (imageInput && imageInput.files && imageInput.files[0]) {
        image = await convertImageToBase64(imageInput.files[0]);
    }

    // ИСПРАВЛЕНО: правильно получаем значение чекбокса холодильника
    const needsColdCheck = document.getElementById('editNeedsCold');
    
    // ИСПРАВЛЕНО: лог для отладки
    console.log('CHECKBOX элемент:', needsColdCheck);
    console.log('CHECKBOX значение (checked):', needsColdCheck ? needsColdCheck.checked : 'элемент не найден');

    const expiryDateInput = document.getElementById('editExpiryDate');

    // [ИСПРАВЛЕНО]: Позволяет сохранять статус холодильника для Продуктов и Медикаментов
    const currentCategory = document.getElementById('editCategory')?.value?.toLowerCase()?.trim() || '';
    const allowedCategories = ['медикаменты', 'продукты', 'замороженные продукты'];
    
    const refrigerationRequired = allowedCategories.includes(currentCategory)
        ? document.getElementById('editNeedsCold')?.checked === true
        : false;

    console.log('Итоговое refrigerationRequired:', refrigerationRequired);

    const updatedData = {
        name: document.getElementById('editName')?.value || '',
        description: document.getElementById('editDescription')?.value || '',
        quantity: Number(document.getElementById('editQuantity')?.value || 0),
        price: Number(document.getElementById('editPrice')?.value || 0),
        supplier: document.getElementById('editSupplier')?.value || '',
        location: document.getElementById('editLocation')?.value || '',
        category: document.getElementById('editCategory')?.value || '',
        image: image,
        refrigerationRequired: refrigerationRequired,
        expiryDate:
    expiryDateInput &&
    expiryDateInput.value
    ? expiryDateInput.value
    : oldProduct.expiryDate || null
    };

    // ===== MEDICINE EXTRA DATA =====
    if (updatedData.category?.trim()?.toLowerCase() === 'медикаменты') {
        updatedData.medicineSeries = document.getElementById('editMedicineSeries')?.value || '';
        updatedData.medicineManufacturer = document.getElementById('editMedicineManufacturer')?.value || '';
        updatedData.medicineDosage = document.getElementById('editMedicineDosage')?.value || '';
        updatedData.medicineType = document.getElementById('editMedicineType')?.value || '';

        const recipeSelect = document.getElementById('editMedicineRecipe');
        updatedData.prescriptionRequired = recipeSelect?.value === 'По рецепту';
    }

    try {
        console.log('Отправляемые данные:', updatedData);

        const response = await fetch(`${APP_CONFIG.API_URL}/${AppState.editingProductId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        const data = await response.json();
        console.log('Ответ сервера:', data);

        if (data.success) {
            closeEditModal();
            loadProducts();
            showStatus('Товар обновлён', 'success');
        } else {
            showStatus(data.error || 'Ошибка обновления', 'error');
        }

    } catch (error) {
        console.error(error);
        showStatus('Ошибка сервера', 'error');
    }
}

// Загружаем модалку при старте
document.addEventListener('DOMContentLoaded', loadEditModal);

// Экспорт в глобальную область
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.saveEditedProduct = saveEditedProduct;