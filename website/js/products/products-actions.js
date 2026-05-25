// ===== ДЕЙСТВИЯ С ТОВАРАМИ (СПИСАНИЕ/ДОБАВЛЕНИЕ/УДАЛЕНИЕ) =====

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