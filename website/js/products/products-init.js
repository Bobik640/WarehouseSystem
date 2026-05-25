// ===== ИНИЦИАЛИЗАЦИЯ =====

// ===== EXPORT MENU =====

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

/* ===== PDF BUTTON ===== */

if(exportPdfBtn){
    exportPdfBtn.addEventListener(
        'click',
        exportToPDF
    );
}

/* ===== EXPORT EXCEL ===== */

if(exportExcelBtn){
    exportExcelBtn.addEventListener(
        'click',
        exportToExcel
    );
}

// ===== ЭКСПОРТ ФУНКЦИЙ В ГЛОБАЛЬНУЮ ОБЛАСТЬ =====

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
window.openEditModal = openEditModal;
window.openActionModal = openActionModal;
window.enableEditMode = enableEditMode;

/* ===================================================== */
/* ================= DOM CONTENT LOADED ================ */
/* ===================================================== */

document.addEventListener(

    'DOMContentLoaded',

    function(){

        // Уведомления
        const notificationBtn = document.getElementById('notificationBtn');
        const notificationOverlay = document.getElementById('notificationOverlay');
        const closeNotificationsBtn = document.getElementById('closeNotificationsBtn');
        const clearNotificationsBtn = document.getElementById('clearNotificationsBtn');

        updateNotificationBadge();

        if(notificationBtn){
            notificationBtn.addEventListener('click', function(){
                if(notificationOverlay) notificationOverlay.classList.add('active');
                renderNotifications();
            });
        }

        if(closeNotificationsBtn){
            closeNotificationsBtn.addEventListener('click', function(){
                if(notificationOverlay) notificationOverlay.classList.remove('active');
            });
        }

        if(clearNotificationsBtn){
            clearNotificationsBtn.addEventListener('click', function(){
                localStorage.removeItem('warehouseNotifications');
                renderNotifications();
                updateNotificationBadge();
            });
        }

        // Модальное окно товара
        const closeProductModalBtn = document.getElementById('closeProductModal');
        const nextProductBtn = document.getElementById('nextProductBtn');
        const prevProductBtn = document.getElementById('prevProductBtn');

        if(closeProductModalBtn){
            closeProductModalBtn.addEventListener('click', closeProductModal);
        }

        if(nextProductBtn){
            nextProductBtn.addEventListener('click', nextProduct);
        }

        if(prevProductBtn){
            prevProductBtn.addEventListener('click', prevProduct);
        }

        // Редактирование
        const closeEditModalBtn = document.getElementById('closeEditModal');
        const saveEditBtn = document.getElementById('saveEditBtn');

        if(closeEditModalBtn){
            closeEditModalBtn.addEventListener('click', closeEditModal);
        }

        if(saveEditBtn){
            saveEditBtn.addEventListener('click', saveEditedProduct);
        }

        // Действия
        const closeActionModalBtn = document.getElementById('closeActionModal');
        const cancelActionBtn = document.getElementById('cancelActionBtn');
        const confirmActionBtn = document.getElementById('confirmActionBtn');

        if(closeActionModalBtn){
            closeActionModalBtn.addEventListener('click', closeActionModal);
        }

        if(cancelActionBtn){
            cancelActionBtn.addEventListener('click', closeActionModal);
        }

        if(confirmActionBtn){
            confirmActionBtn.addEventListener('click', confirmAction);
        }

        // Фильтры
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');

        if(searchInput){
            searchInput.addEventListener('input', applyFilters);
        }

        if(categoryFilter){
            categoryFilter.addEventListener('change', applyFilters);
        }
    }
);