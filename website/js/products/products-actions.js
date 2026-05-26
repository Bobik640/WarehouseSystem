// ===== ДЕЙСТВИЯ С ТОВАРАМИ =====

function openActionModal(type, productId) {
    AppState.currentAction = type;
    AppState.currentProductId = productId;
    
    const title = document.getElementById('actionModalTitle');
    const content = document.getElementById('actionModalContent');
    const overlay = document.getElementById('actionModalOverlay');
    
    if (!title || !content || !overlay) return;
    
    const product = AppState.products.find(p => p._id === productId);
    if (!product) {
        showStatus('Товар не найден', 'error');
        return;
    }
    
    if (type === 'delete') {
        title.innerHTML = '<i class="fas fa-trash-alt"></i> Удаление товара';
        content.innerHTML = `<div class="modal-confirm-text">Вы уверены, что хотите удалить товар <b>${escapeHtml(product.name)}</b>?</div>`;
    } else if (type === 'reduce') {
        title.innerHTML = '<i class="fas fa-minus-circle"></i> Списание товара';
        content.innerHTML = `
            <div class="modal-info-text">Товар: <b>${escapeHtml(product.name)}</b> (Доступно: ${product.quantity} шт.)</div>
            <div class="form-group" style="margin-top: 15px;">
                <input type="number" id="actionAmountInput" class="form-control" min="1" max="${product.quantity}" placeholder="Сколько списать">
            </div>
        `;
    } else if (type === 'add') {
        title.innerHTML = '<i class="fas fa-plus-circle"></i> Пополнение товара';
        content.innerHTML = `
            <div class="modal-info-text">Товар: <b>${escapeHtml(product.name)}</b></div>
            <div class="form-group" style="margin-top: 15px;">
                <input type="number" id="actionAmountInput" class="form-control" min="1" placeholder="Сколько добавить">
            </div>
        `;
    }
    
    overlay.classList.add('active');
    setTimeout(() => {
        const input = document.getElementById('actionAmountInput');
        if (input) input.focus();
    }, 50);
}

function closeActionModal() {
    const overlay = document.getElementById('actionModalOverlay');
    if (overlay) overlay.classList.remove('active');
    AppState.currentAction = null;
    AppState.currentProductId = null;
}

async function confirmAction() {
    if (!AppState.currentProductId || !AppState.currentAction) return;
    
    const confirmBtn = document.getElementById('confirmActionBtn');
    const product = AppState.products.find(p => p._id === AppState.currentProductId);
    if (!product) return;
    
    const setSubmitting = (isSubmitting) => {
        if (confirmBtn) {
            confirmBtn.disabled = isSubmitting;
            confirmBtn.innerHTML = isSubmitting ? '<i class="fas fa-spinner fa-spin"></i> ...' : 'Подтвердить';
        }
    };
    
    if (AppState.currentAction === 'delete') {
        try {
            setSubmitting(true);
            await deleteProduct(AppState.currentProductId);
            closeActionModal();
        } catch (error) {
            console.error(error);
            showStatus('Ошибка при удалении товара', 'error');
        } finally {
            setSubmitting(false);
        }
        return;
    }
    
    const amountInput = document.getElementById('actionAmountInput');
    const amount = amountInput ? Number(amountInput.value) : 0;
    
    if (!amount || amount <= 0 || !Number.isInteger(amount)) {
        showStatus('Введите корректное целое число больше нуля', 'error');
        return;
    }
    
    if (AppState.currentAction === 'reduce') {
        if (amount > product.quantity) {
            showStatus(`Нельзя списать больше, чем есть (${product.quantity} шт.)`, 'error');
            return;
        }
        try {
            setSubmitting(true);
            await reduceQuantity(AppState.currentProductId, amount);
            closeActionModal();
        } catch (error) {
            console.error(error);
            showStatus('Ошибка при списании товара', 'error');
        } finally {
            setSubmitting(false);
        }
        return;
    }
    
    if (AppState.currentAction === 'add') {
        try {
            setSubmitting(true);
            const response = await fetch(`${APP_CONFIG.API_URL}/${AppState.currentProductId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...product,
                    quantity: Number(product.quantity) + amount
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                saveHistory('Пополнение товара', `${product.name} добавлено: ${amount} шт.`);
                showStatus('Товар успешно пополнен', 'success');
                closeActionModal();
                loadProducts();
            } else {
                showStatus(data.error || 'Не удалось обновить данные на сервере', 'error');
            }
        } catch (error) {
            console.error(error);
            showStatus('Ошибка соединения с сервером', 'error');
        } finally {
            setSubmitting(false);
        }
    }
}

window.openActionModal = openActionModal;
window.closeActionModal = closeActionModal;
window.confirmAction = confirmAction;