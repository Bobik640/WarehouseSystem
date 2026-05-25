// ===== ОТОБРАЖЕНИЕ ТОВАРОВ =====

function displayProducts(products){
    var productsList = document.getElementById('productsList');
    if(!productsList) return;

    productsList.innerHTML = '';

    if(!products.length){
        productsList.innerHTML =
            '<div class="products-loading">' +
            '<i class="fas fa-box-open fa-2x"></i>' +
            '<p>Нет товаров</p>' +
            '</div>';
        return;
    }

    for(var i = 0; i < products.length; i++){
        var product = products[i];
        var card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-id', product._id); // Сохраняем ID в дата-атрибут для удобства

        var imageUrl = product.image && product.image.trim() !== '' 
            ? product.image 
            : 'https://placehold.co/600x400/e2e8f0/475569?text=No+Image';

        var isLowStock = Number(product.quantity) < 5;

        // 1. Сначала генерируем СТРУКТУРУ карточки
        card.innerHTML =
            (isLowStock ? '<div class="low-stock-badge">НИЗКИЙ ЗАПАС</div>' : '') +
            (AppState.isLoggedIn
                ? '<div class="product-admin-actions">' +
                  '<button class="product-admin-btn edit-action-trigger">' +
                    '<i class="fas fa-pen"></i>' +
                  '</button>' +
                  '<button class="product-admin-btn delete-action-trigger">' +
                    '<i class="fas fa-trash"></i>' +
                  '</button>' +
                  '<button class="product-admin-btn reduce-action-trigger">' +
                    '<i class="fas fa-minus"></i>' +
                  '</button>' +
                  '<button class="product-admin-btn add-action-trigger">' +
                    '<i class="fas fa-plus"></i>' +
                  '</button>' +
                  '</div>'
                : ''
            ) +
            '<div class="product-card-image">' +
            '<img src="' + imageUrl + '" alt="' + escapeHtml(product.name) + '" onerror="this.src=\'https://placehold.co/600x400/e2e8f0/475569?text=No+Image\'">' +
            '</div>' +
            '<div class="product-card-content">' +
            '<div class="product-card-title">' + escapeHtml(product.name) + '</div>' +
            '<div class="product-card-info">' +
            '<div class="product-price">' + Number(product.price).toLocaleString() + ' сом</div>' +
            '<div class="product-stock ' + (isLowStock ? 'low' : '') + '">' + product.quantity + ' шт.</div>' +
            '</div>' +
            '<div class="product-card-footer">' +
            '<div class="product-category">' + escapeHtml(product.category) + '</div>' +
            '<div class="product-status-group">' +
            (product.expiryDate ? (new Date(product.expiryDate) < new Date() ?
                '<div class="product-danger-badge"><i class="fas fa-skull"></i></div>' :
                '<div class="product-tooltip-wrapper">' +
                '<div class="product-expiry-badge"><i class="fas fa-clock"></i></div>' +
                '<div class="product-tooltip">' +
                '<div class="product-tooltip-title">Добавлен</div>' +
                '<div class="product-tooltip-date">' + new Date(product.createdAt || Date.now()).toLocaleDateString() + '</div>' +
                '<div class="product-tooltip-title">Годен до</div>' +
                '<div class="product-tooltip-date">' + new Date(product.expiryDate).toLocaleDateString() + '</div>' +
                '</div>' +
                '</div>') : ''
            ) +
            (product.refrigerationRequired === true || product.refrigerationRequired === 'true' ?
                '<div class="product-fridge-badge"><i class="fas fa-snowflake"></i></div>' : ''
            ) +
            (product.category === 'Премиум товары' ?
                '<div class="product-vip-badge"><i class="fas fa-gem"></i> VIP</div>' : ''
            ) +
            '</div>' +
            '</div>';

        // 2. А вот ТЕПЕРЬ, когда DOM внутри карточки готов, вешаем все обработчики
        
        // Клик по самой карточке (открытие инфо-модалки)
        (function(index) {
            card.addEventListener('click', function(e) {
                // Если кликнули на админ-панель или любую кнопку внутри неё — игнорируем, чтобы не открывать карточку
                if (e.target.closest('.product-admin-actions')) {
                    return;
                }
                if (typeof openProductModal === 'function') {
                    openProductModal(index);
                }
            });
        })(i);

        // Обработчики кнопок админки (назначаем только если админ залогинен)
        if (AppState.isLoggedIn) {
            var productId = product._id;

            var editBtn = card.querySelector('.edit-action-trigger');
            var deleteBtn = card.querySelector('.delete-action-trigger');
            var reduceBtn = card.querySelector('.reduce-action-trigger');
            var addBtn = card.querySelector('.add-action-trigger');

            if (editBtn) {
                editBtn.addEventListener('click', function(e) {
                    e.stopPropagation(); // Стопаем всплытие к карточке
                    if (typeof window.openEditModal === 'function') {
                        window.openEditModal(productId);
                    } else {
                        console.error('❌ Функция window.openEditModal не найдена в глобальной области!');
                    }
                });
            }

            if (deleteBtn) {
                deleteBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    window.openActionModal('delete', productId);
                });
            }

            if (reduceBtn) {
                reduceBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    window.openActionModal('reduce', productId);
                });
            }

            if (addBtn) {
                addBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    window.openActionModal('add', productId);
                });
            }
        }

        productsList.appendChild(card);
    }
}

function renderProductModal(){
    if (typeof currentProductIndex === 'undefined') return;
    const product = AppState.products[currentProductIndex];
    if(!product) return;

    const container = document.getElementById('productModalContent');
    if(!container) return;

    const image = product.image || 'https://placehold.co/1200x700';

    container.innerHTML =
        '<img class="product-modal-image" src="' + image + '">' +
        '<div class="product-modal-body">' +
        '<div class="product-modal-title">' + escapeHtml(product.name) + '</div>' +
        '<div class="product-modal-description">' + (product.description || 'Описание отсутствует') + '</div>' +
        '<div class="product-modal-grid">' +
        '<div class="product-modal-info"><span>Категория</span><strong>' + escapeHtml(product.category) + '</strong></div>' +
        '<div class="product-modal-info"><span>Количество</span><strong>' + product.quantity + ' шт.</strong></div>' +
        '<div class="product-modal-info"><span>Цена</span><strong>' + Number(product.price).toLocaleString() + ' сом</strong></div>' +
        '<div class="product-modal-info"><span>Дата создания</span><strong>' + new Date(product.createdAt).toLocaleDateString() + '</strong></div>' +
        (product.expiryDate ? '<div class="product-modal-info"><span>Срок годности</span><strong>' + new Date(product.expiryDate).toLocaleDateString() + '</strong></div>' : '') +
        '</div>' +
        '</div>';
}