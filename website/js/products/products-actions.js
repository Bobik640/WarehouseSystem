// ===== ДЕЙСТВИЯ С ТОВАРАМИ (СПИСАНИЕ/ДОБАВЛЕНИЕ/УДАЛЕНИЕ) =====

let currentAction = null;
let currentProductId = null;

/* ===== OPEN ===== */
function openActionModal(type, productId) {
    currentAction = type;
    currentProductId = productId;

    const title = document.getElementById('actionModalTitle');
    const content = document.getElementById('actionModalContent');
    const overlay = document.getElementById('actionModalOverlay');

    // На всякий случай проверяем существование элементов модалки в DOM
    if (!title || !content || !overlay) {
        console.error('❌ Элементы actionModal не найдены в DOM');
        return;
    }

    const product = AppState.products.find(p => p._id === productId);
    if (!product) {
        showStatus('Товар не найден в локальном состоянии', 'error');
        return;
    }

    /* ===== DELETE ===== */
    if (type === 'delete') {
        title.innerHTML = '<i class="fas fa-trash-alt"></i> Удаление товара';
        content.innerHTML = `<div class="modal-confirm-text">Вы уверены, что хотите удалить товар <b>${escapeHtml(product.name)}</b>?</div>`;
    }

    /* ===== REDUCE ===== */
    if (type === 'reduce') {
        title.innerHTML = '<i class="fas fa-minus-circle"></i> Списание товара';
        content.innerHTML = `
            <div class="modal-info-text">Товар: <b>${escapeHtml(product.name)}</b> (Доступно: ${product.quantity} шт.)</div>
            <div class="form-group" style="margin-top: 15px;">
                <input type="number" id="actionAmountInput" class="form-control" min="1" max="${product.quantity}" placeholder="Сколько списать">
            </div>
        `;
    }

    /* ===== ADD ===== */
    if (type === 'add') {
        title.innerHTML = '<i class="fas fa-plus-circle"></i> Пополнение товара';
        content.innerHTML = `
            <div class="modal-info-text">Товар: <b>${escapeHtml(product.name)}</b></div>
            <div class="form-group" style="margin-top: 15px;">
                <input type="number" id="actionAmountInput" class="form-control" min="1" placeholder="Сколько добавить">
            </div>
        `;
    }

    overlay.classList.add('active');
    
    // Фокусируемся на инпуте, если он есть
    setTimeout(() => {
        const input = document.getElementById('actionAmountInput');
        if (input) input.focus();
    }, 50);
}

/* ===== CLOSE ===== */
function closeActionModal() {
    const overlay = document.getElementById('actionModalOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
    currentAction = null;
    currentProductId = null;
}

/* ===== CONFIRM ===== */
async function confirmAction() {
    if (!currentProductId || !currentAction) return;

    const confirmBtn = document.getElementById('confirmActionBtn');
    const product = AppState.products.find(p => p._id === currentProductId);
    if (!product) return;

    // Функция для безопасной блокировки интерфейса на время запроса
    const setSubmitting = (isSubmitting) => {
        if (confirmBtn) {
            confirmBtn.disabled = isSubmitting;
            confirmBtn.innerHTML = isSubmitting ? '<i class="fas fa-spinner fa-spin"></i> ...' : 'Подтвердить';
        }
    };

    /* ===== DELETE ===== */
    if (currentAction === 'delete') {
        try {
            setSubmitting(true);
            await deleteProduct(currentProductId); // Предполагаем, что функция сама обновляет UI/лоадер
            closeActionModal();
        } catch (error) {
            console.error(error);
            showStatus('Ошибка при удалении товара', 'error');
        } finally {
            setSubmitting(false);
        }
        return;
    }

    // Для ADD и REDUCE вытаскиваем и валидируем введенное количество
    const amountInput = document.getElementById('actionAmountInput');
    const amount = amountInput ? Number(amountInput.value) : 0;

    if (!amount || amount <= 0 || !Number.isInteger(amount)) {
        showStatus('Введите корректное целое число больше нуля', 'error');
        return;
    }

    /* ===== REDUCE ===== */
    if (currentAction === 'reduce') {
        if (amount > product.quantity) {
            showStatus(`Нельзя списать больше, чем есть (${product.quantity} шт.)`, 'error');
            return;
        }
        try {
            setSubmitting(true);
            await reduceQuantity(currentProductId, amount); // Предполагаем, что функция описана в products-api.js
            closeActionModal();
        } catch (error) {
            console.error(error);
            showStatus('Ошибка при списании товара', 'error');
        } finally {
            setSubmitting(false);
        }
        return;
    }

    /* ===== ADD ===== */
    if (currentAction === 'add') {
        try {
            setSubmitting(true);
            const response = await fetch(`${APP_CONFIG.API_URL}/${currentProductId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...product, // Изящно копируем все старые свойства объекта
                    quantity: Number(product.quantity) + amount // Перезаписываем только количество
                })
            });

            const data = await response.json();

            if (data.success) {
                if (typeof saveHistory === 'function') {
                    saveHistory('Пополнение товара', `${product.name} добавлено: ${amount} шт.`);
                }
                showStatus('Товар успешно пополнен', 'success');
                closeActionModal();
                
                if (typeof loadProducts === 'function') {
                    loadProducts();
                }
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

// ===== ИНИЦИАЛИЗАЦИЯ СЛУШАТЕЛЕЙ СОБЫТИЙ =====
document.addEventListener('DOMContentLoaded', () => {
    const cancelBtn = document.getElementById('cancelActionBtn');
    const confirmBtn = document.getElementById('confirmActionBtn');
    const closeBtn = document.getElementById('closeActionModal'); // Кнопка-крестик, если она есть

    if (cancelBtn) cancelBtn.addEventListener('click', closeActionModal);
    if (confirmBtn) confirmBtn.addEventListener('click', confirmAction);
    if (closeBtn) closeBtn.addEventListener('click', closeActionModal);
});

// ===== ЭКСПОРТ ФУНКЦИЙ В ГЛОБАЛЬНУЮ ОБЛАСТЬ =====
window.openActionModal = openActionModal;
window.closeActionModal = closeActionModal;
window.confirmAction = confirmAction;

console.log('✅ products-actions.js загружен, функции экспортированы');