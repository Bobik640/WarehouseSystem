// ===== УВЕДОМЛЕНИЯ =====

function createNotification(title, message) {
    let notifications = JSON.parse(localStorage.getItem('warehouseNotifications') || '[]');
    
    const exists = notifications.find(item => item.message === message);
    if (exists) return;
    
    notifications.unshift({
        id: Date.now(),
        title,
        message,
        time: new Date().toLocaleString()
    });
    
    localStorage.setItem('warehouseNotifications', JSON.stringify(notifications));
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const badge = document.getElementById('notificationCount');
    if (!badge) return;
    
    const notifications = JSON.parse(localStorage.getItem('warehouseNotifications') || '[]');
    
    if (notifications.length) {
        badge.style.display = 'flex';
        badge.textContent = notifications.length;
    } else {
        badge.style.display = 'none';
    }
}

function renderNotifications() {
    const container = document.getElementById('notificationsContent');
    if (!container) return;
    
    const notifications = JSON.parse(localStorage.getItem('warehouseNotifications') || '[]');
    
    if (!notifications.length) {
        container.innerHTML = `
            <div class="history-empty">
                <i class="fas fa-bell-slash"></i>
                <p>Нет уведомлений</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = notifications.map(item => `
        <div class="notification-item">
            <strong>${item.title}</strong>
            <p>${item.message}</p>
            <span class="notification-time">${item.time}</span>
        </div>
    `).join('');
}

function checkLowStockNotifications() {
    AppState.products.forEach(product => {
        if (Number(product.quantity) <= 5) {
            createNotification(
                'Заканчивается товар',
                `${product.name} осталось ${product.quantity} шт.`
            );
        }
    });
}

window.createNotification = createNotification;
window.updateNotificationBadge = updateNotificationBadge;
window.renderNotifications = renderNotifications;
window.checkLowStockNotifications = checkLowStockNotifications;