// ===== ОТОБРАЖЕНИЕ ТОВАРОВ =====

function displayProducts(products) {
    const productsList = document.getElementById('productsList');
    if (!productsList) return;
    
    productsList.innerHTML = '';
    
    if (!products.length) {
        productsList.innerHTML = `
            <div class="products-loading">
                <i class="fas fa-box-open fa-2x"></i>
                <p>Нет товаров</p>
            </div>
        `;
        return;
    }
    
    products.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-id', product._id);
        
        const imageUrl = product.image && product.image.trim() !== '' 
            ? product.image 
            : 'https://placehold.co/600x400/e2e8f0/475569?text=No+Image';
        
        const isLowStock = Number(product.quantity) < 5;
        
        let adminActions = '';
        if (AppState.isLoggedIn) {
            adminActions = `
                <div class="product-admin-actions">
                    <button class="product-admin-btn edit-action-trigger" data-id="${product._id}" data-index="${index}">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="product-admin-btn delete-action-trigger" data-id="${product._id}">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="product-admin-btn reduce-action-trigger" data-id="${product._id}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="product-admin-btn add-action-trigger" data-id="${product._id}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            `;
        }
        
        card.innerHTML = `
            ${isLowStock ? '<div class="low-stock-badge">НИЗКИЙ ЗАПАС</div>' : ''}
            ${adminActions}
            <div class="product-card-image">
                <img src="${imageUrl}" alt="${escapeHtml(product.name)}" onerror="this.src='https://placehold.co/600x400/e2e8f0/475569?text=No+Image'">
            </div>
            <div class="product-card-content">
                <div class="product-card-title">${escapeHtml(product.name)}</div>
                <div class="product-card-info">
                    <div class="product-price">${Number(product.price).toLocaleString()} сом</div>
                    <div class="product-stock ${isLowStock ? 'low' : ''}">${product.quantity} шт.</div>
                </div>
                <div class="product-card-footer">
                    <div class="product-category">
                        ${escapeHtml(product.category)}
                    </div>
                    <div class="product-status-group">
                        ${
                        product.expiryDate
                        ? (
                            new Date(product.expiryDate)
                            < new Date()
                            ?
                            `
                                <div class="product-danger-wrapper">

                                <div class="product-danger-badge">
                                    <i class="fas fa-skull"></i>
                                </div>

                                ${createDangerTooltip(product)}

                            </div>
                            `
                            :
                            `
                                <div class="product-tooltip-wrapper">

                                <div class="product-expiry-badge">
                                    <i class="fas fa-clock"></i>
                                </div>

                                ${createExpiryTooltip(product)}

                            </div>
                            `
                        )
                        : ''
                    }
                    ${
                        product.refrigerationRequired
                        ?
                        `
                            <div class="product-fridge-wrapper">

                            <div class="product-fridge-badge">
                                <i class="fas fa-snowflake"></i>
                            </div>

                            ${createFridgeTooltip()}

                        </div>
                        `
                        : ''
                    }
                    ${
                        product.category ===
                        'Премиум товары'
                        ?
                        `
                            <div class="product-vip-wrapper">

                            <div class="product-vip-badge">
                                <i class="fas fa-gem"></i>
                                VIP
                            </div>

                            ${createVipTooltip()}

                        </div>
                        `
                        : ''
                    }
                    </div>
                </div>
            </div>
        `;
        
        // Обработчики
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.product-admin-actions')) {
                // ИЩЕМ РЕАЛЬНЫЙ ИНДЕКС ТОВАРА В ГЛАВНОМ МАССИВЕ
                const realIndex = AppState.products.findIndex(p => p._id === product._id);
                openModernProductModal(realIndex !== -1 ? realIndex : index);
            }
        });
        
        if (AppState.isLoggedIn) {
            const editBtn = card.querySelector('.edit-action-trigger');
            const deleteBtn = card.querySelector('.delete-action-trigger');
            const reduceBtn = card.querySelector('.reduce-action-trigger');
            const addBtn = card.querySelector('.add-action-trigger');
            
            if (editBtn) editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openEditModal(product._id);
            });
            if (deleteBtn) deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openActionModal('delete', product._id);
            });
            if (reduceBtn) reduceBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openActionModal('reduce', product._id);
            });
            if (addBtn) addBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openActionModal('add', product._id);
            });
        }
        
        productsList.appendChild(card);
    });
}

function renderProductModal() {
    const product = AppState.products[AppState.currentProductIndex];
    if (!product) return;
    
    const container = document.getElementById('productModalContent');
    if (!container) return;
    
    const image = product.image || 'https://placehold.co/1200x700';
    
    container.innerHTML = `
        <img class="product-modal-image" src="${image}">
        <div class="product-modal-body">
            <div class="product-modal-title">${escapeHtml(product.name)}</div>
            <div class="product-modal-description">${product.description || 'Описание отсутствует'}</div>
            <div class="product-modal-grid">
                <div class="product-modal-info"><span>Категория</span><strong>${escapeHtml(product.category)}</strong></div>
                <div class="product-modal-info"><span>Количество</span><strong>${product.quantity} шт.</strong></div>
                <div class="product-modal-info"><span>Цена</span><strong>${Number(product.price).toLocaleString()} сом</strong></div>
                <div class="product-modal-info"><span>Дата создания</span><strong>${new Date(product.createdAt).toLocaleDateString()}</strong></div>
                ${product.expiryDate ? `<div class="product-modal-info"><span>Срок годности</span><strong>${new Date(product.expiryDate).toLocaleDateString()}</strong></div>` : ''}
            </div>
        </div>
    `;
}

window.displayProducts = displayProducts;
window.renderProductModal = renderProductModal;