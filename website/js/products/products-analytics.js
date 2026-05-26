// ===== АНАЛИТИКА =====

function updateAnalytics() {
    if (!AppState.products.length) return;
    
    const categoryMap = {
        electronics: 0, clothing: 0, products: 0, sports: 0, auto: 0,
        appliances: 0, office: 0, furniture: 0, build: 0, medical: 0,
        beauty: 0, chem: 0, toys: 0, pc: 0, accessories: 0, tools: 0,
        light: 0, plumbing: 0, home: 0, garden: 0, pets: 0, drinks: 0,
        frozen: 0, vip: 0, other: 0
    };
    
    AppState.products.forEach(product => {
        const category = (product.category || '').toLowerCase();
        if (category.includes('элект')) categoryMap.electronics++;
        else if (category.includes('одеж')) categoryMap.clothing++;
        else if (category.includes('прод')) categoryMap.products++;
        else if (category.includes('спорт')) categoryMap.sports++;
        else if (category.includes('авто')) categoryMap.auto++;
        else if (category.includes('бытовая техник')) categoryMap.appliances++;
        else if (category.includes('канцел')) categoryMap.office++;
        else if (category.includes('меб')) categoryMap.furniture++;
        else if (category.includes('стро')) categoryMap.build++;
        else if (category.includes('мед')) categoryMap.medical++;
        else if (category.includes('космет')) categoryMap.beauty++;
        else if (category.includes('хими')) categoryMap.chem++;
        else if (category.includes('игруш')) categoryMap.toys++;
        else if (category.includes('пк')) categoryMap.pc++;
        else if (category.includes('аксесс')) categoryMap.accessories++;
        else if (category.includes('инстру')) categoryMap.tools++;
        else if (category.includes('освещ')) categoryMap.light++;
        else if (category.includes('сантех')) categoryMap.plumbing++;
        else if (category.includes('дом')) categoryMap.home++;
        else if (category.includes('сад')) categoryMap.garden++;
        else if (category.includes('зоо')) categoryMap.pets++;
        else if (category.includes('напит')) categoryMap.drinks++;
        else if (category.includes('заморож')) categoryMap.frozen++;
        else if (category.includes('премиум')) categoryMap.vip++;
        else categoryMap.other++;
    });
    
    const totalProducts = AppState.products.length || 1;
    
    const setBar = (id, value) => {
        const elem = document.getElementById(id);
        if (elem) elem.style.width = ((value / totalProducts) * 100) + '%';
    };
    
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
    
    // Популярная категория
    let topCategory = 'Нет данных';
    let maxCount = 0;
    for (const category in categoryMap) {
        if (categoryMap[category] > maxCount) {
            maxCount = categoryMap[category];
            const names = {
                electronics: 'Электроника', clothing: 'Одежда', products: 'Продукты',
                sports: 'Спорт', auto: 'Автозапчасти', appliances: 'Бытовая техника',
                office: 'Канцелярия', furniture: 'Мебель', build: 'Строительные материалы',
                medical: 'Медикаменты', beauty: 'Косметика', chem: 'Бытовая химия',
                toys: 'Игрушки', pc: 'Комплектующие ПК', accessories: 'Аксессуары',
                tools: 'Инструменты', light: 'Освещение', plumbing: 'Сантехника',
                home: 'Товары для дома', garden: 'Сад и огород', pets: 'Зоотовары',
                drinks: 'Напитки', frozen: 'Замороженные продукты', vip: 'Премиум товары'
            };
            topCategory = names[category] || 'Другое';
        }
    }
    
    // Самый дорогой товар
    let expensive = AppState.products[0];
    AppState.products.forEach(product => {
        if (Number(product.price) > Number(expensive.price)) expensive = product;
    });
    
    // Товары с истекающим сроком
    const today = new Date();
    const expiryProducts = AppState.products
        .filter(product => {
            if (!product.expiryDate) return false;
            const expiry = new Date(product.expiryDate);
            const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);
            return diffDays <= 7;
        })
        .map(product => product.name);
    
    // Товары с низким запасом
    const lowProducts = AppState.products
        .filter(product => Number(product.quantity) < 5)
        .map(product => product.name);
    
    const topCategoryElem = document.getElementById('topCategory');
    const expensiveElem = document.getElementById('expensiveProduct');
    const lowStockProductsElem = document.getElementById('lowStockProducts');
    const expiryProductsElem = document.getElementById('expiryProducts');
    
    if (topCategoryElem) topCategoryElem.textContent = topCategory;
    if (expensiveElem) expensiveElem.textContent = expensive.name;
    if (lowStockProductsElem) {
        lowStockProductsElem.textContent = lowProducts.length ? lowProducts.join(' • ') : 'Нет товаров с низким запасом';
    }
    if (expiryProductsElem) {
        expiryProductsElem.textContent = expiryProducts.length ? expiryProducts.join(' • ') : 'Нет товаров с истекающим сроком';
    }
}

window.updateAnalytics = updateAnalytics;