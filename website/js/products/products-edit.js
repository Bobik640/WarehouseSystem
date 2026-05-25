// ===== РЕДАКТИРОВАНИЕ ТОВАРА =====

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