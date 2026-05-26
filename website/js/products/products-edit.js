// ===== РЕДАКТИРОВАНИЕ ТОВАРА =====

function openEditModal(productId) {

    const product =

        AppState.products.find(
            p => p._id === productId
        );

    if (!product) return;

    AppState.editingProductId =
        productId;

    const expiryInput =

        document.getElementById(
            'editExpiryDate'
        );

    if(expiryInput){

        expiryInput.value =
            product.expiryDate || '';
    }

    const coldToggle =

        document.getElementById(
            'editNeedsCold'
        );

    if(coldToggle){

        coldToggle.checked =
            product.refrigerationRequired || false;
    }

    document.getElementById(
        'editModalTitle'
    ).textContent = product.name;

    document.getElementById(
        'editName'
    ).value = product.name || '';

    document.getElementById(
        'editDescription'
    ).value = product.description || '';

    document.getElementById(
        'editQuantity'
    ).value = product.quantity || 0;

    document.getElementById(
        'editPrice'
    ).value = product.price || 0;

    document.getElementById(
        'editSupplier'
    ).value = product.supplier || '';

    document.getElementById(
        'editLocation'
    ).value = product.location || '';

    document.getElementById(
        'editCategory'
    ).value = product.category || '';

    document.getElementById(
        'editPreviewImage'
    ).src = product.image || '';

    document.getElementById(
        'editModalOverlay'
    ).style.display = 'flex';
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

    const coldCheckbox =

    document.getElementById(
        'editNeedsCold'
    );

const refrigerationRequired =

    coldCheckbox
    ? coldCheckbox.checked
    : false;
    
    const updatedData = {
        expiryDate: document.getElementById('editExpiryDate')?.value || '',
        refrigerationRequired:
    refrigerationRequired,
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

window.openEditModal = openEditModal;
window.saveEditedProduct = saveEditedProduct;