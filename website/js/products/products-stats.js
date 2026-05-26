// ===== СТАТИСТИКА =====

function updateStats() {
    const totalProductsElem = document.getElementById('totalProducts');
    const totalValueElem = document.getElementById('totalValue');
    const lowStockElem = document.getElementById('lowStock');
    
    if (totalProductsElem) {
        totalProductsElem.textContent = AppState.products.length;
    }
    
    let totalValue = 0;
    for (let i = 0; i < AppState.products.length; i++) {
        totalValue += AppState.products[i].quantity * AppState.products[i].price;
    }
    
    if (totalValueElem) {
        totalValueElem.textContent = formatMoney(totalValue);
    }
    
    let lowStockCount = 0;
    for (let i = 0; i < AppState.products.length; i++) {
        if (AppState.products[i].quantity < 5) lowStockCount++;
    }
    
    if (lowStockElem) {
        lowStockElem.textContent = lowStockCount;
    }
    
    updateAnalytics();
    checkLowStockNotifications();
}

window.updateStats = updateStats;