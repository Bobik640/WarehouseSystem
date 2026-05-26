// ===== РЕДАКТИРОВАНИЕ ТОВАРА =====

function openEditModal(productId) {
    const product = AppState.products.find(p => p._id === productId);
    if (!product) return;
    
    AppState.editingProductId = productId;
    
    document.getElementById('editModalTitle').textContent = product.name;
    document.getElementById('editName').value = product.name || '';
    document.getElementById('editDescription').value = product.description || '';
    document.getElementById('editQuantity').value = product.quantity || 0;
    document.getElementById('editPrice').value = product.price || 0;
    document.getElementById('editSupplier').value = product.supplier || '';
    document.getElementById('editLocation').value = product.location || '';
    document.getElementById('editCategory').value = product.category || '';
    document.getElementById('editPreviewImage').src = product.image || '';
    document.getElementById('editModalOverlay').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editModalOverlay').style.display = 'none';
    AppState.editingProductId = null;
}

async function saveEditedProduct() {
    if (!AppState.editingProductId) return;
    
    const oldProduct = AppState.products.find(p => p._id === AppState.editingProductId);
    if (!oldProduct) return;
    
    let image = oldProduct.image || '';
    const imageInput = document.getElementById('editImage');
    
    if (imageInput.files && imageInput.files[0]) {
        image = await convertImageToBase64(imageInput.files[0]);
    }
    
    const updatedData = {
        name: document.getElementById('editName').value,
        description: document.getElementById('editDescription').value,
        quantity: Number(document.getElementById('editQuantity').value),
        price: Number(document.getElementById('editPrice').value),
        supplier: document.getElementById('editSupplier').value,
        location: document.getElementById('editLocation').value,
        category: document.getElementById('editCategory').value,
        image
    };
    
    try {
        const response = await fetch(`${APP_CONFIG.API_URL}/${AppState.editingProductId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeEditModal();
            loadProducts();
            showStatus('Товар обновлён', 'success');
        }
    } catch (error) {
        console.error(error);
        showStatus('Ошибка сервера', 'error');
    }
}

// Инициализация слушателей для модалки редактирования
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('closeEditModalBtn');
    const saveBtn = document.getElementById('saveEditBtn');
    const overlay = document.getElementById('editModalOverlay');
    
    if (closeBtn) closeBtn.addEventListener('click', closeEditModal);
    if (saveBtn) saveBtn.addEventListener('click', saveEditedProduct);
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target.id === 'editModalOverlay') closeEditModal();
        });
    }
    
    // Drag & drop для редактирования
    const uploadZone = document.querySelector('.edit-upload-zone');
    const fileInput = document.getElementById('editImage');
    const preview = document.getElementById('editPreviewImage');
    
    if (uploadZone && fileInput && preview) {
        uploadZone.onclick = () => fileInput.click();
        
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
            if (file) {
                fileInput.files = e.dataTransfer.files;
                const reader = new FileReader();
                reader.onload = (event) => preview.src = event.target.result;
                reader.readAsDataURL(file);
            }
        });
        
        fileInput.addEventListener('change', () => {
            const file = fileInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => preview.src = event.target.result;
                reader.readAsDataURL(file);
            }
        });
    }
});

window.openEditModal = openEditModal;
window.saveEditedProduct = saveEditedProduct;