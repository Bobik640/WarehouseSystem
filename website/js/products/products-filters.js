// ===== ФИЛЬТРАЦИЯ ТОВАРОВ =====

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