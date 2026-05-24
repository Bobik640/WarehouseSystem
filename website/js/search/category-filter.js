function setupCategoryFilter(){

    const searchInput =
        document.getElementById(
            'searchInput'
        );

    const categoryFilter =
        document.getElementById(
            'categoryFilter'
        );

    if(
        !searchInput ||
        !categoryFilter
    ) return;

    function applyFilters(){

        const searchValue =
            searchInput.value
            .toLowerCase();

        const categoryValue =
            categoryFilter.value;

        const filtered =
            AppState.products.filter(
                function(product){

                    const matchesSearch =
                        product.name
                        .toLowerCase()
                        .includes(searchValue);

                    const matchesCategory =
                        categoryValue === 'all'
                        ||
                        product.category ===
                        categoryValue;

                    return (
                        matchesSearch &&
                        matchesCategory
                    );
                }
            );

        displayProducts(filtered);
    }

    searchInput.addEventListener(
        'input',
        applyFilters
    );

    categoryFilter.addEventListener(
        'change',
        applyFilters
    );
}

document.addEventListener(
    'DOMContentLoaded',
    setupCategoryFilter
);