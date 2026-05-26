// ===== МОДАЛЬНОЕ ОКНО ТОВАРА =====

function openProductModal(index) {
    AppState.currentProductIndex = index;
    renderProductModal();
    
    const overlay = document.getElementById('productModalOverlay');
    if (overlay) overlay.classList.add('active');
}

function closeProductModal() {
    const overlay = document.getElementById('productModalOverlay');
    if (overlay) overlay.classList.remove('active');
}

function nextProduct() {
    AppState.currentProductIndex++;
    if (AppState.currentProductIndex >= AppState.products.length) {
        AppState.currentProductIndex = 0;
    }
    renderProductModal();
}

function prevProduct() {
    AppState.currentProductIndex--;
    if (AppState.currentProductIndex < 0) {
        AppState.currentProductIndex = AppState.products.length - 1;
    }
    renderProductModal();
}

window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.nextProduct = nextProduct;
window.prevProduct = prevProduct;