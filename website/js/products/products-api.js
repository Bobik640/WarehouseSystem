// ===== API ВЫЗОВЫ =====

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