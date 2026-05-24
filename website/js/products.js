// ===== ЗАГРУЗКА ТОВАРОВ =====

async function loadProducts() {
    try {
        AppState.isLoading = true;

        showStatus(
            'Загрузка товаров...',
            'success'
        );

        var response = await fetch(
            APP_CONFIG.API_URL
        );

        var data = await response.json();

        if(data.success){
            AppState.products = data.data || [];
        } else {
            AppState.products = [];
            showStatus(
                'Ошибка загрузки товаров',
                'error'
            );
        }

        // ПОКАЗЫВАЕМ ТОВАРЫ
        applyFilters();

        // ОБНОВЛЯЕМ СТАТИСТИКУ
        updateStats();

        // ПЕРЕПРИМЕНЯЕМ ТЕМУ
        setTimeout(function(){
            const savedTheme =
                localStorage.getItem('warehouseTheme')
                || 'purple';

            if(typeof setTheme === 'function'){
                setTheme(savedTheme);
            }
        }, 50);

        showStatus(
            'Загружено ' +
            AppState.products.length +
            ' товаров',
            'success'
        );

    } catch(error){
        console.error(error);
        showStatus(
            'Ошибка подключения к серверу',
            'error'
        );
        AppState.products = [];
        displayProducts([]);
    } finally {
        AppState.isLoading = false;
    }
}

// ===== ФУНКЦИЯ СОХРАНЕНИЯ ИСТОРИИ =====

function saveHistory(action, details) {
    var history = JSON.parse(localStorage.getItem('warehouseHistory') || '[]');
    
    var historyItem = {
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

// ===== ПОКАЗ ТОВАРОВ =====

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

/* ===== FILTER PRODUCTS ===== */

function applyFilters(){

    const searchInput =
        document.getElementById(
            'searchInput'
        );

    const categoryFilter =
        document.getElementById(
            'categoryFilter'
        );

    const searchValue =
        searchInput.value
        .toLowerCase()
        .trim();

    const selectedCategory =
        categoryFilter.value;

    let filteredProducts =
        AppState.products.filter(product => {

            const matchesSearch =

                product.name
                .toLowerCase()
                .includes(searchValue);

            const matchesCategory =

                selectedCategory === 'all'

                ||

                product.category ===
                selectedCategory;

            return (
                matchesSearch &&
                matchesCategory
            );
        });

    displayProducts(
        filteredProducts
    );
}

for(var i = 0; i < products.length; i++){
        var product = products[i];
        var card = document.createElement('div');
        (function(index){

    card.addEventListener(

        'click',

        function(){

            openProductModal(index);
        }
    );

})(i);
        card.className = 'product-card';

        // ПРАВИЛЬНАЯ ОБРАБОТКА ИЗОБРАЖЕНИЯ
        var imageUrl = product.image && product.image.trim() !== '' 
            ? product.image 
            : 'https://placehold.co/600x400/e2e8f0/475569?text=No+Image';

        var isLowStock = Number(product.quantity) < 5;

        card.innerHTML =
            (isLowStock ? '<div class="low-stock-badge">НИЗКИЙ ЗАПАС</div>' : '') +
            (AppState.isLoggedIn
                ? '<div class="product-admin-actions">' +


'<button class="product-admin-btn" onclick="event.stopPropagation(); openEditModal(\'' + product._id + '\')">' +

'<i class="fas fa-pen"></i>' +

'</button>' +


'<button class="product-admin-btn" onclick="event.stopPropagation(); openActionModal(\'delete\', \'' + product._id + '\')">' +

'<i class="fas fa-trash"></i>' +

'</button>' +


'<button class="product-admin-btn" onclick="event.stopPropagation(); openActionModal(\'reduce\', \'' + product._id + '\')">' +

'<i class="fas fa-minus"></i>' +

'</button>' +


'<button class="product-admin-btn" onclick="event.stopPropagation(); openActionModal(\'add\', \'' + product._id + '\')">' +

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


'<div class="product-category">' +

escapeHtml(product.category) +

'</div>' +


'<div class="product-status-group">' +


(

    product.expiryDate

    ?

    (

        new Date(product.expiryDate) < new Date()

        ?

        '<div class="product-danger-badge">' +

        '<i class="fas fa-skull"></i>' +

        '</div>'

        :

        '<div class="product-expiry-badge">' +

        '<i class="fas fa-clock"></i>' +

        '</div>'
    )

    : ''
)

+


(
    product.refrigerationRequired === true ||

    product.refrigerationRequired === 'true'

    ?

    '<div class="product-fridge-badge">' +

    '<i class="fas fa-snowflake"></i>' +

    '</div>'

    : ''
)

+


(

    product.category === 'Премиум товары'

    ?

    '<div class="product-vip-badge">' +

    '<i class="fas fa-gem"></i> VIP' +

    '</div>'

    : ''
)


+

'</div>' +

'</div>';

        productsList.appendChild(card);
    }
}

// ===== ДОБАВЛЕНИЕ ТОВАРА =====

async function addNewProduct(){
    if(!AppState.isLoggedIn){
        showStatus('Войдите в систему', 'error');
        showLoginModal();
        return;
    }

    var nameInput = document.getElementById('productName');
    var quantityInput = document.getElementById('productQuantity');
    var categorySelect = document.getElementById('productCategory');
    var priceInput = document.getElementById('productPrice');
    var imageInput = document.getElementById('productImage');
    var descriptionInput = document.getElementById('productDescription');
    var supplierInput = document.getElementById('productSupplier');
    var locationInput = document.getElementById('productLocation');

    var name = nameInput.value.trim();
    var quantity = parseInt(quantityInput.value);
    var category = categorySelect.value;
    var price = parseFloat(priceInput.value);
    let image = '';

if(imageInput && imageInput.files[0]){

    const file = imageInput.files[0];

    image = await convertImageToBase64(file);
}
    var description = descriptionInput ? descriptionInput.value.trim() : '';
    var supplier = supplierInput ? supplierInput.value.trim() : '';
    var location = locationInput ? locationInput.value.trim() : '';

    /* ===== MEDICINE ===== */

var medicineSeries =
    document.getElementById(
        'medicineSeries'
    )?.value || '';

var medicineManufacturer =
    document.getElementById(
        'medicineManufacturer'
    )?.value || '';

var medicineDosage =
    document.getElementById(
        'medicineDosage'
    )?.value || '';

var medicineType =
    document.getElementById(
        'medicineType'
    )?.value || '';

var prescriptionRequired =
    document.getElementById(
        'prescriptionRequired'
    )?.value === 'true';

var refrigerationRequired = false;

var refrigerationCheckbox =

    document.getElementById(
        'refrigerationRequired'
    );


if(refrigerationCheckbox){

    refrigerationRequired =
        refrigerationCheckbox.checked;
}
    
    var expiryDateInput = document.getElementById('productExpiryDate');
    var expiryDate = expiryDateInput ? expiryDateInput.value || null : null;

    if(!name){
        showStatus('Введите название', 'error');
        return;
    }

    if(isNaN(quantity) || quantity < 1){
        showStatus('Количество должно быть больше 0', 'error');
        return;
    }

    if(isNaN(price) || price < 0){
        showStatus('Цена не может быть отрицательной', 'error');
        return;
    }

    try {
        var requestBody = {
            name: name,
            quantity: quantity,
            category: category,
            price: price,
            expiryDate: expiryDate,
            description: description,
            supplier: supplier,
            location: location,
            medicineSeries: medicineSeries,
            medicineManufacturer: medicineManufacturer,
            medicineDosage: medicineDosage,
            medicineType: medicineType,
            prescriptionRequired: prescriptionRequired,
            refrigerationRequired: refrigerationRequired,
        };

        if(image){
            requestBody.image = image;
        }

        console.log(requestBody);

        var response = await fetch(
            APP_CONFIG.API_URL,
            {
                method:'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify(requestBody)
            }
        );

        var data = await response.json();

        if(data.success){
            saveHistory(
                'Добавление товара',
                'Товар: ' + name + '\n' +
                'Количество: ' + quantity + '\n' +
                'Категория: ' + category + '\n' +
                'Цена: ' + price + ' сом'
            );

            showStatus('Товар добавлен', 'success');

            // Очищаем поля формы
            nameInput.value = '';
            quantityInput.value = '1';
            priceInput.value = '0';
            if(expiryDateInput) expiryDateInput.value = '';
            if(imageInput) imageInput.value = '';
            if(descriptionInput) descriptionInput.value = '';
            if(supplierInput) supplierInput.value = '';
            if(locationInput) locationInput.value = '';

            // Скрываем предпросмотр изображения
            var previewWrapper = document.getElementById('imagePreviewWrapper');
            if(previewWrapper) previewWrapper.style.display = 'none';

            loadProducts();
        } else {
            showStatus(
                data.error || 'Ошибка при добавлении товара',
                'error'
            );
        }

    } catch(error){
        console.error(error);
        showStatus(
            'Ошибка сервера: ' + error.message,
            'error'
        );
    }
}

// ===== СПИСАНИЕ =====

async function reduceQuantity(productId, productName){
    if(!AppState.isLoggedIn){
        showStatus('Войдите в систему', 'error');
        showLoginModal();
        return;
    }

    if(!productName) {
        var product = AppState.products.find(p => p._id === productId);
        productName = product ? product.name : 'Товар';
    }

    try {
        var response = await fetch(
            APP_CONFIG.API_URL + '/' + productId + '/reduce',
            {
                method:'PUT',
                headers:{
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify({
                    quantity: parseInt(arguments[1])
                })
            }
        );

        var data = await response.json();

        if(data.success){
            saveHistory(
                'Списание товара',
                'Товар: ' + productName + '\n' +
                'Списано: ' + arguments[1] + ' шт.'
            );

            showStatus('Товар списан', 'success');
            loadProducts();
        } else {
            showStatus(data.error || 'Ошибка', 'error');
        }

    } catch(error){
        console.error(error);
        showStatus('Ошибка сервера', 'error');
    }
}

// ===== УДАЛЕНИЕ =====

async function deleteProduct(productId, productName){
    if(!AppState.isLoggedIn){
        showStatus('Войдите в систему', 'error');
        showLoginModal();
        return;
    }

    if(!productName) {
        var product = AppState.products.find(p => p._id === productId);
        productName = product ? product.name : 'Товар';
    }

    try {
        var response = await fetch(
            APP_CONFIG.API_URL + '/' + productId,
            {
                method:'DELETE'
            }
        );

        var data = await response.json();

        if(data.success){
            saveHistory(
                'Удаление товара',
                'Товар: ' + productName + '\n' +
                'Товар удалён со склада'
            );

            showStatus('Товар удалён', 'success');
            loadProducts();
        } else {
            showStatus(data.error || 'Ошибка', 'error');
        }

    } catch(error){
        console.error(error);
        showStatus('Ошибка сервера', 'error');
    }
}

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

/* ===== ANALYTICS ===== */

function updateAnalytics(){
    if(!AppState.products.length) return;

    const categoryMap = {

    electronics:0,

    clothing:0,

    products:0,

    sports:0,

    auto:0,

    appliances:0,

    office:0,

    furniture:0,

    build:0,

    medical:0,

    beauty:0,

    chem:0,

    toys:0,

    pc:0,

    accessories:0,

    tools:0,

    light:0,

    plumbing:0,

    home:0,

    garden:0,

    pets:0,

    drinks:0,

    frozen:0,

    vip:0,

    other:0
};

    AppState.products.forEach(product => {
        const category = (product.category || '').toLowerCase();

        if(category.includes('элект')){

            categoryMap.electronics++;
        }

        else if(category.includes('одеж')){

            categoryMap.clothing++;
        }

        else if(category.includes('прод')){

            categoryMap.products++;
        }

        else if(category.includes('спорт')){

            categoryMap.sports++;
        }

        else if(category.includes('авто')){

            categoryMap.auto++;
        }

        else if(category.includes('бытовая техник')){

            categoryMap.appliances++;
        }

        else if(category.includes('канцел')){

            categoryMap.office++;
        }

        else if(category.includes('меб')){

            categoryMap.furniture++;
        }

        else if(category.includes('стро')){

            categoryMap.build++;
        }

        else if(category.includes('мед')){

            categoryMap.medical++;
        }

        else if(category.includes('космет')){

            categoryMap.beauty++;
        }

        else if(category.includes('хими')){

            categoryMap.chem++;
        }

        else if(category.includes('игруш')){

            categoryMap.toys++;
        }

        else if(category.includes('пк')){

            categoryMap.pc++;
        }

        else if(category.includes('аксесс')){

            categoryMap.accessories++;
        }

        else if(category.includes('инстру')){

            categoryMap.tools++;
        }

        else if(category.includes('освещ')){

            categoryMap.light++;
        }

        else if(category.includes('сантех')){

            categoryMap.plumbing++;
        }

        else if(category.includes('дом')){

            categoryMap.home++;
        }

        else if(category.includes('сад')){

            categoryMap.garden++;
        }

        else if(category.includes('зоо')){

            categoryMap.pets++;
        }

        else if(category.includes('напит')){

            categoryMap.drinks++;
        }

        else if(category.includes('заморож')){

            categoryMap.frozen++;
        }

        else if(category.includes('премиум')){

            categoryMap.vip++;
        }

        else{

            categoryMap.other++;
        }
    });

    /* ===== BARS ===== */
    const maxValue = Math.max(...Object.values(categoryMap), 1);

    function setBar(id,value){
        const elem = document.getElementById(id);
        if(elem){
            elem.style.width = ((value / maxValue) * 100) + '%';
        }
    }

    setBar('electronicsBar', categoryMap.electronics);
    setBar('clothingBar', categoryMap.clothing);
    setBar('productsBar', categoryMap.products);
    setBar('sportsBar', categoryMap.sports);
    setBar('otherBar', categoryMap.other);
    setBar('autoBar', categoryMap.auto);
    setBar('appliancesBar', categoryMap.appliances);
    setBar('officeBar', categoryMap.office);
    setBar('furnitureBar', categoryMap.furniture);
    setBar('buildBar', categoryMap.build);
    setBar('medicalBar', categoryMap.medical);
    setBar('beautyBar', categoryMap.beauty);
    setBar('chemBar', categoryMap.chem);
    setBar('toysBar', categoryMap.toys);
    setBar('pcBar', categoryMap.pc);
    setBar('accessoriesBar', categoryMap.accessories);
    setBar('toolsBar', categoryMap.tools);
    setBar('lightBar', categoryMap.light);
    setBar('plumbingBar', categoryMap.plumbing);
    setBar('homeBar', categoryMap.home);
    setBar('gardenBar', categoryMap.garden);
    setBar('petsBar', categoryMap.pets);
    setBar('drinksBar', categoryMap.drinks);
    setBar('frozenBar', categoryMap.frozen);
    setBar('vipBar', categoryMap.vip);

    let topCategory = 'Нет данных';
    let maxCount = 0;

    for(const category in categoryMap){
        if(categoryMap[category] > maxCount){
            maxCount = categoryMap[category];
            if(category === 'electronics') topCategory = 'Электроника';
            else if(category === 'clothing') topCategory = 'Одежда';
            else if(category === 'products') topCategory = 'Продукты';
            else if(category === 'sports') topCategory = 'Спорт';
            else topCategory = 'Другое';
        }
    }

    let expensive = AppState.products[0];
    AppState.products.forEach(product => {
        if(Number(product.price) > Number(expensive.price)){
            expensive = product;
        }
    });

    const topCategoryElem = document.getElementById('topCategory');
    const expensiveElem = document.getElementById('expensiveProduct');
    const lowStockProductsElem = document.getElementById('lowStockProducts');
    const expiryProductsElem = document.getElementById('expiryProducts');

    /* ===== EXPIRY PRODUCTS ===== */
    const today = new Date();
    const expiryProducts = AppState.products
        .filter(product => {
            if(!product.expiryDate) return false;
            const expiry = new Date(product.expiryDate);
            const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);
            return diffDays <= 7;
        })
        .map(product => product.name);

    if(expiryProductsElem){
        if(expiryProducts.length){
            expiryProductsElem.textContent = expiryProducts.join(' • ');
        } else {
            expiryProductsElem.textContent = 'Нет товаров с истекающим сроком';
        }
    }

    if(topCategoryElem){
        topCategoryElem.textContent = topCategory;
    }

    if(expensiveElem){
        expensiveElem.textContent = expensive.name;
    }

    /* ===== LOW STOCK ===== */
    const lowProducts = AppState.products
        .filter(product => Number(product.quantity) < 5)
        .map(product => product.name);

    if(lowStockProductsElem){
        if(lowProducts.length){
            lowStockProductsElem.textContent = lowProducts.join(' • ');
        } else {
            lowStockProductsElem.textContent = 'Нет товаров с низким запасом';
        }
    }
}

// ===== ESCAPE HTML =====

function escapeHtml(str){
    if(!str) return '';
    return str.replace(
        /[&<>'"]/g,
        function(m){
            if(m === '&') return '&amp;';
            if(m === '<') return '&lt;';
            if(m === '>') return '&gt;';
            if(m === '"') return '&quot;';
            if(m === "'") return '&#39;';
            return m;
        }
    );
}

// ===== CATEGORY LISTENER =====

function setupCategoryListener(){
    var categorySelect = document.getElementById('productCategory');
    var expiryGroup = document.getElementById('expiryDateGroup');

    if(!categorySelect || !expiryGroup) return;

    categorySelect.addEventListener(
        'change',
        function(){

    const medicineFields =

        document.getElementById(
            'medicineFields'
        );


    /* ===== EXPIRY ===== */

    if(

        this.value === 'Продукты' ||

        this.value === 'Медикаменты'
    ){

        expiryGroup.style.display =
            'block';

    } else {

        expiryGroup.style.display =
            'none';
    }


    /* ===== MEDICINE ===== */

    if(

        this.value === 'Медикаменты'
    ){

        medicineFields.style.display =
            'block';

    } else {

        medicineFields.style.display =
            'none';
    }
}
    );
}

/* ===== EXPORT MENU ===== */

var exportBtn = document.getElementById('exportBtn');
var exportMenu = document.getElementById('exportMenu');
var exportExcelBtn = document.getElementById('exportExcelBtn');
var exportPdfBtn = document.getElementById('exportPdfBtn');

if(exportBtn && exportMenu){
    exportBtn.addEventListener(
        'click',
        function(e){
            e.stopPropagation();
            exportMenu.classList.toggle('active');
        }
    );
}

document.addEventListener(
    'click',
    function(e){
        if(exportMenu && !e.target.closest('.export-wrapper')){
            exportMenu.classList.remove('active');
        }
    }
);

/* ===== EXPORT EXCEL ===== */

if(exportExcelBtn){
    exportExcelBtn.addEventListener(
        'click',
        exportToExcel
    );
}

/* ===== EXPORT PDF ===== */

function exportToPDF(){
    if(!AppState.products.length){
        showStatus('Нет товаров для экспорта', 'error');
        return;
    }

    // Создаем окно для красивой печати / экспорта в системный PDF
    const printWindow = window.open('', '_blank');
    let tableRows = '';
    let totalValue = 0;
    
    AppState.products.forEach(product => {
        const cost = product.quantity * product.price;
        totalValue += cost;
        tableRows += `
            <tr>
                <td>${escapeHtml(product.name)}</td>
                <td>${escapeHtml(product.category)}</td>
                <td style="text-align: center;">${product.quantity}</td>
                <td style="text-align: right;">${Number(product.price).toLocaleString()} сом</td>
                <td style="text-align: right;">${cost.toLocaleString()} сом</td>
            </tr>
        `;
    });
    
    printWindow.document.write(`
        <html>
        <head>
            <title>Отчет по складу - ${new Date().toLocaleDateString()}</title>
            <style>
                body { font-family: sans-serif; margin: 40px; color: #333; }
                h1 { text-align: center; color: #764BA2; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background-color: #667EEA; color: white; }
                tr:nth-child(even) { background-color: #f9f9f9; }
                .total-row { font-weight: bold; background-color: #e2e8f0; }
                .date { text-align: right; margin-bottom: 20px; color: #666; }
            </style>
        </head>
        <body>
            <h1>ОТЧЕТ ПО СКЛАДУ (WAREHOUSE REPORT)</h1>
            <div class="date">Дата генерации: ${new Date().toLocaleString()}</div>
            <table>
                <thead>
                    <tr>
                        <th>Название</th>
                        <th>Категория</th>
                        <th>Количество</th>
                        <th>Цена</th>
                        <th>Стоимость</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                    <tr class="total-row">
                        <td colspan="4" style="text-align: right;">ИТОГО:</td>
                        <td style="text-align: right;">${totalValue.toLocaleString()} сом</td>
                    </tr>
                </tbody>
            </table>
            <script>
                window.onload = function() {
                    window.print();
                    window.close();
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
    showStatus('Документ отправлен на печать/PDF', 'success');
}

/* ===== PDF BUTTON ===== */

if(exportPdfBtn){
    exportPdfBtn.addEventListener(
        'click',
        exportToPDF
    );
}

/* ===================================================== */
/* ================= EXPORT EXCEL ====================== */
/* ===================================================== */

async function exportToExcel(){
    if(!AppState.products.length){
        showStatus('Нет товаров для экспорта', 'error');
        return;
    }

    if(typeof ExcelJS === 'undefined'){
        showStatus('Библиотека Excel не загружена', 'error');
        return;
    }

    try {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Warehouse Report');

        /* ===== TITLE ===== */
        sheet.mergeCells('A1:E1');
        const title = sheet.getCell('A1');
        title.value = 'WAREHOUSE REPORT';
        title.font = {
            size:20,
            bold:true,
            color:{argb:'FFFFFFFF'}
        };
        title.alignment = {
            vertical:'middle',
            horizontal:'center'
        };
        title.fill = {
            type:'pattern',
            pattern:'solid',
            fgColor:{argb:'667EEA'}
        };

        sheet.getRow(1).height = 30;

        /* ===== HEADERS ===== */
        const headers = [
            'Название',
            'Категория',
            'Количество',
            'Цена',
            'Стоимость'
        ];

        sheet.addRow([]);

        const headerRow = sheet.addRow(headers);
        headerRow.eachCell(cell=>{
            cell.font = {
                bold:true,
                color:{argb:'FFFFFFFF'}
            };
            cell.fill = {
                type:'pattern',
                pattern:'solid',
                fgColor:{argb:'764BA2'}
            };
            cell.alignment = {
                horizontal:'center'
            };
            cell.border = {
                top:{style:'thin'},
                left:{style:'thin'},
                bottom:{style:'thin'},
                right:{style:'thin'}
            };
        });

        /* ===== DATA ===== */
        AppState.products.forEach(product=>{
            sheet.addRow([
                product.name,
                product.category,
                product.quantity,
                product.price,
                product.quantity * product.price
            ]);
        });

        /* ===== STYLES ===== */
        sheet.columns = [
            { width:35 },
            { width:20 },
            { width:15 },
            { width:15 },
            { width:18 }
        ];

        sheet.eachRow((row,rowNumber)=>{
            if(rowNumber <= 3) return;
            row.eachCell(cell=>{
                cell.border = {
                    top:{style:'thin'},
                    left:{style:'thin'},
                    bottom:{style:'thin'},
                    right:{style:'thin'}
                };
            });
        });

        /* ===== TOTAL ===== */
        const total = AppState.products.reduce((sum,p)=> sum + (p.price * p.quantity), 0);

        sheet.addRow([]);
        const totalRow = sheet.addRow([
            '', '', '', 'ИТОГО:', total
        ]);

        totalRow.font = {
            bold:true
        };

        /* ===== EXPORT ===== */
        const buffer = await workbook.xlsx.writeBuffer();

        const blob = new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = 'warehouse-report.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showStatus('Excel экспортирован', 'success');
    } catch(error){
        console.error(error);
        showStatus('Ошибка экспорта Excel: ' + error.message, 'error');
    }
}

/* ===================================================== */
/* ================= IMAGE TO BASE64 =================== */
/* ===================================================== */

function convertImageToBase64(file){

    return new Promise(function(resolve){

        const reader = new FileReader();

        reader.onload = function(e){

            resolve(e.target.result);
        };

        reader.readAsDataURL(file);
    });
}

// ===== EXPORT ФУНКЦИЙ =====

window.loadProducts = loadProducts;
window.displayProducts = displayProducts;
window.addNewProduct = addNewProduct;
window.reduceQuantity = reduceQuantity;
window.deleteProduct = deleteProduct;
window.updateStats = updateStats;
window.setupCategoryListener = setupCategoryListener;
window.saveHistory = saveHistory;
window.exportToExcel = exportToExcel;
window.exportToPDF = exportToPDF;

/* ===================================================== */
/* ================= NOTIFICATIONS ===================== */
/* ===================================================== */

function createNotification(title,message){

    let notifications =

        JSON.parse(

            localStorage.getItem(
                'warehouseNotifications'
            ) || '[]'
        );


    const exists = notifications.find(item =>

        item.message === message
    );

    if(exists) return;


    notifications.unshift({

        id:Date.now(),

        title,
        message,

        time:new Date().toLocaleString()
    });


    localStorage.setItem(

        'warehouseNotifications',

        JSON.stringify(notifications)
    );

    updateNotificationBadge();
}


/* ===== BADGE ===== */

function updateNotificationBadge(){

    const badge =

        document.getElementById(
            'notificationCount'
        );

    if(!badge) return;


    const notifications =

        JSON.parse(

            localStorage.getItem(
                'warehouseNotifications'
            ) || '[]'
        );


    if(notifications.length){

        badge.style.display = 'flex';

        badge.textContent =
            notifications.length;

    } else {

        badge.style.display = 'none';
    }
}


/* ===== RENDER ===== */

function renderNotifications(){

    const container =

        document.getElementById(
            'notificationsContent'
        );

    if(!container) return;


    const notifications =

        JSON.parse(

            localStorage.getItem(
                'warehouseNotifications'
            ) || '[]'
        );


    if(!notifications.length){

        container.innerHTML =

            '<div class="history-empty">' +

            '<i class="fas fa-bell-slash"></i>' +

            '<p>Нет уведомлений</p>' +

            '</div>';

        return;
    }


    container.innerHTML =

        notifications.map(item =>

            '<div class="notification-item">' +

            '<strong>' +

            item.title +

            '</strong>' +

            '<p>' +

            item.message +

            '</p>' +

            '<span class="notification-time">' +

            item.time +

            '</span>' +

            '</div>'

        ).join('');
}


/* ===== LOW STOCK ===== */

function checkLowStockNotifications(){

    AppState.products.forEach(product => {

        if(Number(product.quantity) <= 5){

            createNotification(

                'Заканчивается товар',

                product.name +
                ' осталось ' +
                product.quantity +
                ' шт.'
            );
        }
    });
}


/* ===== EVENTS ===== */

document.addEventListener(

    'DOMContentLoaded',

    function(){

        const btn =
            document.getElementById(
                'notificationBtn'
            );

        const overlay =
            document.getElementById(
                'notificationOverlay'
            );

        const closeBtn =
            document.getElementById(
                'closeNotificationsBtn'
            );

        const clearBtn =
            document.getElementById(
                'clearNotificationsBtn'
            );


        updateNotificationBadge();


        if(btn){

            btn.addEventListener(
                'click',
                function(){

                    overlay.classList.add(
                        'active'
                    );

                    renderNotifications();
                }
            );
        }


        if(closeBtn){

            closeBtn.addEventListener(
                'click',
                function(){

                    overlay.classList.remove(
                        'active'
                    );
                }
            );
        }


        if(clearBtn){

            clearBtn.addEventListener(
                'click',
                function(){

                    localStorage.removeItem(
                        'warehouseNotifications'
                    );

                    renderNotifications();

                    updateNotificationBadge();
                }
            );
        }
    }
);

/* ===================================================== */
/* ================= PRODUCT MODAL ===================== */
/* ===================================================== */

let currentProductIndex = 0;


/* ===== OPEN ===== */

function openProductModal(index){

    currentProductIndex = index;

    renderProductModal();

    const overlay =

        document.getElementById(
            'productModalOverlay'
        );

    if(overlay){

        overlay.classList.add('active');
    }
}


/* ===== CLOSE ===== */

function closeProductModal(){

    const overlay =

        document.getElementById(
            'productModalOverlay'
        );

    if(overlay){

        overlay.classList.remove('active');
    }
}


/* ===== RENDER ===== */

function renderProductModal(){

    const product =

        AppState.products[
            currentProductIndex
        ];

    if(!product) return;


    const container =

        document.getElementById(
            'productModalContent'
        );

    if(!container) return;


    const image =

        product.image ||

        'https://placehold.co/1200x700';


    container.innerHTML =

        '<img class="product-modal-image" src="' +

        image +

        '">' +


        '<div class="product-modal-body">' +


        '<div class="product-modal-title">' +

        escapeHtml(product.name) +

        '</div>' +


        '<div class="product-modal-description">' +

        (product.description ||

        'Описание отсутствует') +

        '</div>' +


        '<div class="product-modal-grid">' +


        '<div class="product-modal-info">' +

        '<span>Категория</span>' +

        '<strong>' +

        escapeHtml(product.category) +

        '</strong>' +

        '</div>' +


        '<div class="product-modal-info">' +

        '<span>Количество</span>' +

        '<strong>' +

        product.quantity +

        ' шт.</strong>' +

        '</div>' +


        '<div class="product-modal-info">' +

        '<span>Цена</span>' +

        '<strong>' +

        Number(product.price)
        .toLocaleString() +

        ' сом</strong>' +

        '</div>' +


        '<div class="product-modal-info">' +

        '<span>Дата создания</span>' +

        '<strong>' +

        new Date(product.createdAt)
        .toLocaleDateString() +

        '</strong>' +

        '</div>' +


        (product.expiryDate

            ?

            '<div class="product-modal-info">' +

            '<span>Срок годности</span>' +

            '<strong>' +

            new Date(product.expiryDate)
            .toLocaleDateString() +

            '</strong>' +

            '</div>'

            : ''

        ) +


        '</div>' +

        '</div>';
}


/* ===== NEXT ===== */

function nextProduct(){

    currentProductIndex++;

    if(
        currentProductIndex >=
        AppState.products.length
    ){

        currentProductIndex = 0;
    }

    renderProductModal();
}


/* ===== PREV ===== */

function prevProduct(){

    currentProductIndex--;

    if(currentProductIndex < 0){

        currentProductIndex =

            AppState.products.length - 1;
    }

    renderProductModal();
}


/* ===== EVENTS ===== */

document.addEventListener(

    'DOMContentLoaded',

    function(){

        const closeBtn =

            document.getElementById(
                'closeProductModal'
            );

        const nextBtn =

            document.getElementById(
                'nextProductBtn'
            );

        const prevBtn =

            document.getElementById(
                'prevProductBtn'
            );


        if(closeBtn){

            closeBtn.addEventListener(
                'click',
                closeProductModal
            );
        }


        if(nextBtn){

            nextBtn.addEventListener(
                'click',
                nextProduct
            );
        }


        if(prevBtn){

            prevBtn.addEventListener(
                'click',
                prevProduct
            );
        }
    }
);

/* ===================================================== */
/* ================= EDIT PRODUCT ====================== */
/* ===================================================== */

let editingProductId = null;


/* ===== OPEN ===== */

function openEditModal(productId){

    const product =

        AppState.products.find(

            p => p._id === productId
        );

    if(!product) return;


    editingProductId = productId;


    document.getElementById('editName').value =

        product.name || '';


    document.getElementById('editDescription').value =

        product.description || '';


    document.getElementById('editCategory').value =

        product.category || '';


    document.getElementById('editQuantity').value =

        product.quantity || 0;


    document.getElementById('editPrice').value =

        product.price || 0;


    document.getElementById('editSupplier').value =

        product.supplier || '';


    document.getElementById('editLocation').value =

        product.location || '';


    if(product.expiryDate){

        document.getElementById(
            'editExpiryDate'
        ).value =

            product.expiryDate
            .split('T')[0];
    }


    document.getElementById(
        'editModalOverlay'
    ).classList.add('active');
}


/* ===== CLOSE ===== */

function closeEditModal(){

    document.getElementById(
        'editModalOverlay'
    ).classList.remove('active');
}


/* ===== SAVE ===== */

async function saveEditedProduct(){

    if(!editingProductId) return;


    const imageInput =

        document.getElementById(
            'editImage'
        );


    let image = '';


    if(imageInput.files[0]){

        image = await convertImageToBase64(

            imageInput.files[0]
        );

    } else {

        const oldProduct =

            AppState.products.find(

                p => p._id === editingProductId
            );

        image = oldProduct.image || '';
    }


    const updatedData = {

        name:
            document.getElementById(
                'editName'
            ).value,

        description:
            document.getElementById(
                'editDescription'
            ).value,

        category:
            document.getElementById(
                'editCategory'
            ).value,

        quantity:
            Number(
                document.getElementById(
                    'editQuantity'
                ).value
            ),

        price:
            Number(
                document.getElementById(
                    'editPrice'
                ).value
            ),

        supplier:
            document.getElementById(
                'editSupplier'
            ).value,

        location:
            document.getElementById(
                'editLocation'
            ).value,

        expiryDate:
            document.getElementById(
                'editExpiryDate'
            ).value,

        image:image
    };


    const response = await fetch(

        APP_CONFIG.API_URL +

        '/' +

        editingProductId,

        {

            method:'PUT',

            headers:{
                'Content-Type':'application/json'
            },

            body:JSON.stringify(
                updatedData
            )
        }
    );


    const data =
        await response.json();


    if(data.success){

        closeEditModal();

        loadProducts();

        showStatus(
            'Товар обновлён',
            'success'
        );
    }
}


/* ===== EVENTS ===== */

document.addEventListener(

    'DOMContentLoaded',

    function(){

        const closeBtn =

            document.getElementById(
                'closeEditModal'
            );

        const saveBtn =

            document.getElementById(
                'saveEditBtn'
            );


        if(closeBtn){

            closeBtn.addEventListener(
                'click',
                closeEditModal
            );
        }


        if(saveBtn){

            saveBtn.addEventListener(
                'click',
                saveEditedProduct
            );
        }
    }
);

/* ===================================================== */
/* ================= ACTION MODAL ====================== */
/* ===================================================== */

let currentAction = null;

let currentProductId = null;


/* ===== OPEN ===== */

function openActionModal(type, productId){

    currentAction = type;

    currentProductId = productId;


    const title =

        document.getElementById(
            'actionModalTitle'
        );

    const content =

        document.getElementById(
            'actionModalContent'
        );

    const overlay =

        document.getElementById(
            'actionModalOverlay'
        );


    const product =

        AppState.products.find(

            p => p._id === productId
        );


    if(!product) return;


    /* ===== DELETE ===== */

    if(type === 'delete'){

        title.innerHTML =
            'Удаление товара';


        content.innerHTML =

            '<div>' +

            'Удалить товар <b>' +

            escapeHtml(product.name) +

            '</b> ?' +

            '</div>';
    }


    /* ===== REDUCE ===== */

    if(type === 'reduce'){

        title.innerHTML =
            'Списание товара';


        content.innerHTML =

            '<div>' +

            'Товар: <b>' +

            escapeHtml(product.name) +

            '</b>' +

            '</div>' +


            '<input type=\"number\" id=\"reduceAmountInput\" placeholder=\"Сколько списать\">';
    }

    /* ===== ADD ===== */

if(type === 'add'){

    title.innerHTML =
        'Пополнение товара';


    content.innerHTML =

        '<div>' +

        'Товар: <b>' +

        escapeHtml(product.name) +

        '</b>' +

        '</div>' +


        '<input type=\"number\" id=\"reduceAmountInput\" placeholder=\"Сколько добавить\">';
}


    overlay.classList.add('active');
}


/* ===== CLOSE ===== */

function closeActionModal(){

    document.getElementById(
        'actionModalOverlay'
    ).classList.remove('active');
}


/* ===== CONFIRM ===== */

async function confirmAction(){

    if(!currentProductId) return;


    /* ===== DELETE ===== */

    if(currentAction === 'delete'){

        await deleteProduct(currentProductId);

        closeActionModal();

        return;
    }


    /* ===== REDUCE ===== */

    if(currentAction === 'reduce'){

        const amount =

            Number(

                document.getElementById(
                    'reduceAmountInput'
                ).value
            );


        if(!amount || amount <= 0){

            showStatus(
                'Введите количество',
                'error'
            );

            return;
        }


        await reduceQuantity(

            currentProductId,

            amount
        );

        closeActionModal();

        return;
    }


    /* ===== ADD ===== */

    if(currentAction === 'add'){

        const amount =

            Number(

                document.getElementById(
                    'reduceAmountInput'
                ).value
            );


        if(!amount || amount <= 0){

            showStatus(
                'Введите количество',
                'error'
            );

            return;
        }


        const product =

            AppState.products.find(

                p => p._id === currentProductId
            );


        if(!product) return;


        try{

            const response = await fetch(

                APP_CONFIG.API_URL +

                '/' +

                currentProductId,

                {

                    method:'PUT',

                    headers:{
                        'Content-Type':'application/json'
                    },

                    body:JSON.stringify({

    name:product.name,

    quantity:
        Number(product.quantity)
        +
        amount,

    category:product.category,

    price:product.price,

    description:product.description,

    supplier:product.supplier,

    location:product.location,

    image:product.image,

    expiryDate:product.expiryDate,

    medicineSeries:
        product.medicineSeries,

    medicineManufacturer:
        product.medicineManufacturer,

    medicineDosage:
        product.medicineDosage,

    medicineType:
        product.medicineType,

    prescriptionRequired:
        product.prescriptionRequired,

    refrigerationRequired:
        product.refrigerationRequired
})
                }
            );


            const data =
                await response.json();


            if(data.success){

                saveHistory(

                    'Пополнение товара',

                    product.name +

                    ' добавлено: ' +

                    amount +

                    ' шт.'
                );


                showStatus(
                    'Товар пополнен',
                    'success'
                );

                closeActionModal();

                loadProducts();

            } else {

                showStatus(
                    data.error || 'Ошибка',
                    'error'
                );
            }

        }catch(error){

            console.error(error);

            showStatus(
                'Ошибка сервера',
                'error'
            );
        }
    }
}


/* ===== EVENTS ===== */

document.addEventListener(

    'DOMContentLoaded',

    function(){

        const closeBtn =

            document.getElementById(
                'closeActionModal'
            );

        const cancelBtn =

            document.getElementById(
                'cancelActionBtn'
            );

        const confirmBtn =

            document.getElementById(
                'confirmActionBtn'
            );


        if(closeBtn){

            closeBtn.addEventListener(
                'click',
                closeActionModal
            );
        }


        if(cancelBtn){

            cancelBtn.addEventListener(
                'click',
                closeActionModal
            );
        }


        if(confirmBtn){

            confirmBtn.addEventListener(
                'click',
                confirmAction
            );
        }
    }
);

window.openEditModal = openEditModal;

window.openActionModal = openActionModal;

/* ===================================================== */
/* ================= ENABLE EDIT ======================= */
/* ===================================================== */

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


window.enableEditMode =
    enableEditMode;

/* ===== FILTER EVENTS ===== */

document.addEventListener(

    'DOMContentLoaded',

    function(){

        const searchInput =
            document.getElementById(
                'searchInput'
            );

        const categoryFilter =
            document.getElementById(
                'categoryFilter'
            );

        if(searchInput){

            searchInput.addEventListener(
                'input',
                applyFilters
            );
        }

        if(categoryFilter){

            categoryFilter.addEventListener(
                'change',
                applyFilters
            );
        }
    }
);