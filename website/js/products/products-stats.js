// ===== СТАТИСТИКА =====

function updateStats(){
    var totalProductsElem = document.getElementById('totalProducts');
    var totalValueElem = document.getElementById('totalValue');
    var lowStockElem = document.getElementById('lowStock');

    if(totalProductsElem){
        totalProductsElem.textContent = AppState.products.length;
    }

    var totalValue = 0;
    for(var i = 0; i < AppState.products.length; i++){
        totalValue += AppState.products[i].quantity * AppState.products[i].price;
    }

    if(totalValueElem){
        totalValueElem.textContent = formatMoney(totalValue);
    }

    var lowStockCount = 0;
    for(var i = 0; i < AppState.products.length; i++){
        if(AppState.products[i].quantity < 5){
            lowStockCount++;
        }
    }

    if(lowStockElem){
        lowStockElem.textContent = lowStockCount;
    }

    /* ===== ANALYTICS ===== */
    updateAnalytics();
    
    checkLowStockNotifications();
}

/* ===== FORMAT MONEY ===== */

function formatMoney(value){
    if(value >= 1000000){
        return ((value / 1000000).toFixed(1) + 'M сом');
    }
    if(value >= 1000){
        return ((value / 1000).toFixed(1) + 'K сом');
    }
    return value.toFixed(0) + ' сом';
}

function enableEditMode(enable){

    const formControls =

        document.querySelectorAll(

            '.product-form input, .product-form textarea, .product-form select'
        );


    formControls.forEach(function(control){

        control.disabled = !enable;
    });


    const btnAdd =

        document.getElementById(
            'btnAdd'
        );


    if(btnAdd){

        btnAdd.disabled = !enable;
    }
}