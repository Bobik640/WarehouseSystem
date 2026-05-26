// ===== УТИЛИТЫ (ОБЩИЕ ФУНКЦИИ) =====

// Сохранение истории
function saveHistory(action, details) {
    const history = JSON.parse(localStorage.getItem('warehouseHistory') || '[]');
    
    const historyItem = {
        id: Date.now(),
        action: action,
        details: details,
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleString(),
        admin: AppState.isLoggedIn ? 'Админ' : 'Гость'
    };
    
    history.unshift(historyItem);
    if (history.length > 200) history.pop();
    localStorage.setItem('warehouseHistory', JSON.stringify(history));
}

// Экранирование HTML (защита от XSS)
function escapeHtml(str) {
    if (!str) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return str.replace(/[&<>"']/g, m => map[m]);
}

// Конвертация изображения в Base64
function convertImageToBase64(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

// Форматирование денег
function formatMoney(value) {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M сом';
    if (value >= 1000) return (value / 1000).toFixed(1) + 'K сом';
    return value.toFixed(0) + ' сом';
}

// Включение/выключение режима редактирования
function enableEditMode(enable) {
    const formControls = document.querySelectorAll(
        '.product-form input, .product-form textarea, .product-form select'
    );
    formControls.forEach(control => control.disabled = !enable);
    
    const btnAdd = document.getElementById('btnAdd');
    if (btnAdd) btnAdd.disabled = !enable;
}

// Показать статус (уведомление)
function showStatus(message, type) {
    const oldStatus = document.querySelector('.status-bar');
    if (oldStatus) oldStatus.remove();
    
    const statusBar = document.createElement('div');
    statusBar.className = `status-bar ${type}`;
    const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
    statusBar.innerHTML = `<i class="fas fa-${icon}"></i><span>${message}</span>`;
    
    document.body.appendChild(statusBar);
    
    setTimeout(() => {
        if (statusBar.parentNode) statusBar.remove();
    }, 3000);
}

// Экспорт в глобальную область
window.saveHistory = saveHistory;
window.escapeHtml = escapeHtml;
window.convertImageToBase64 = convertImageToBase64;
window.formatMoney = formatMoney;
window.enableEditMode = enableEditMode;
window.showStatus = showStatus;