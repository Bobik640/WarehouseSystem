// ===== МОДАЛЬНОЕ ОКНО ТОВАРА =====

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