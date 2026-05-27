/* ===================================================== */
/* ================= MODERN PRODUCT MODAL ============== */
/* ===================================================== */

let modernCurrentIndex = 0;

/* OPEN */

function openModernProductModal(index) {
    modernCurrentIndex = index;

    // 1. СНАЧАЛА делаем окно видимым (чтобы браузер смог посчитать высоту текста)
    const overlay = document.getElementById('modernProductModalOverlay');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // 2. ТОЛЬКО ПОСЛЕ ЭТОГО запускаем рендер и проверки
    renderModernProduct();
}

/* CLOSE */

function closeModernProductModal() {
    const overlay = document.getElementById('modernProductModalOverlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

/* ===================================================== */
/* ================= RENDER ============================ */
/* ===================================================== */

function renderModernProduct() {
    const product = AppState.products[modernCurrentIndex];

    if (!product) return;

    /* IMAGE */
    const image = document.getElementById('modernProductImage');
    image.src =
    product.image?.trim()
    ||
    'https://placehold.co/600x800';

image.onerror = () => {

    image.src =
    'https://placehold.co/600x800';
};
    image.alt = product.name || 'Товар';

    /* TITLE */
    document.getElementById('modernProductTitle').textContent = product.name || 'Без названия';

    /* CATEGORY */
    const categoryEl = document.querySelector('.modern-product-category');
    if (categoryEl) {
        categoryEl.textContent = product.category || 'Без категории';
    }

    /* DESCRIPTION */
    const description = document.getElementById('modernProductDescription');
    description.textContent = product.description || 'Описание отсутствует';
    description.style.wordBreak =
    'break-word';
    
    // Сбрасываем классы и даем время браузеру посчитать высоту
    description.classList.remove('expanded', 'collapsed');
    description.classList.add('collapsed');

    // GRID - обязательно вызываем после установки description
    const grid = document.getElementById('modernProductGrid');
    if (grid) {
        grid.innerHTML = createModernGrid(product);
    }

    /* STATUS */
    renderModernStatus(product);

    /* READ MORE - запускаем с небольшой задержкой для корректного расчета scrollHeight */
    setTimeout(() => {
        setupReadMore();
    }, 50);
}

/* ===================================================== */
/* ================= GRID ============================== */
/* ===================================================== */

function createModernGrid(product) {
    let gridHtml = '';

    // Основные поля (всегда показываем)
    gridHtml += createInfoCard('Количество', (product.quantity ?? 0) + ' шт');
    gridHtml += createInfoCard('Цена', (product.price ?? 0) + ' сом');
    gridHtml += createInfoCard('Поставщик', product.supplier);
    gridHtml += createInfoCard('Местоположение', product.location);

    // Дата добавления товара
    if (product.createdAt) {
        const dateAdded = new Date(product.createdAt);
        if (!isNaN(dateAdded.getTime())) {
            gridHtml += createInfoCard('Дата добавления', dateAdded.toLocaleDateString('ru-RU'));
        }
    }

    // Срок годности
    if (product.expiryDate) {
        try {
            const expiryDate = new Date(product.expiryDate);
            if (!isNaN(expiryDate.getTime())) {
                gridHtml += createInfoCard('Срок годности', expiryDate.toLocaleDateString('ru-RU'));
            }
        } catch(e) {
            console.warn('Ошибка парсинга даты:', product.expiryDate);
        }
    }

    // Медикаменты - дополнительные поля
    const category = (product.category || '').trim().toLowerCase();
    
    if (category === 'медикаменты') {
        gridHtml += createInfoCard('Производитель', product.medicineManufacturer);
        gridHtml += createInfoCard('Дозировка', product.medicineDosage);
        gridHtml += createInfoCard('Тип', product.medicineType);
    }

    // Если ничего не добавилось - показываем сообщение
    if (!gridHtml) {
        gridHtml = '<div class="modern-info-empty">Нет дополнительной информации</div>';
    }

    return gridHtml;
}

/* ===================================================== */
/* ================= STATUS ============================ */
/* ===================================================== */

function renderModernStatus(product) {
    // Ищет контейнер и по ID, и по классам, чтобы точно найти место для иконок
    const container = document.getElementById('modernProductStatus') || document.getElementById('modernProductBadges') || document.querySelector('.modern-product-status');
    if (!container) return;
    
    container.innerHTML = '';

    /* VIP */
    if (
    product.category
    ?.trim()
    ?.toLowerCase()
    ===
    'премиум товары'
) {
        container.innerHTML += `
            <div class="product-vip-badge">
                <i class="fas fa-gem"></i>
                VIP
            </div>
        `;
    }

    /* FRIDGE */
    if (product.refrigerationRequired) {
        container.innerHTML += `
            <div class="product-fridge-badge">
                <i class="fas fa-snowflake"></i>
            </div>
        `;
    }

    /* EXPIRY */
    if (product.expiryDate) {
        try {
            const expiry = new Date(product.expiryDate);
            const now = new Date();
            
            if (!isNaN(expiry.getTime())) {
                if (expiry < now) {
                    container.innerHTML += `
                        <div class="product-danger-badge">
                            <i class="fas fa-skull"></i>
                        </div>
                    `;
                } else {
                    container.innerHTML += `
                        <div class="product-expiry-badge">
                            <i class="fas fa-clock"></i>
                        </div>
                    `;
                }
            }
        } catch(e) {
            console.warn('Ошибка парсинга даты expiry:', product.expiryDate);
        }
    }
}

/* ===================================================== */
/* ================= READ MORE ========================= */
/* ===================================================== */

function setupReadMore(){

    const description =
    document.getElementById(
        'modernProductDescription'
    );

    const button =
    document.getElementById(
        'modernReadMoreBtn'
    );

    if(
        !description ||
        !button
    ){
        return;
    }

    button.style.display = 'none';

    description.classList.remove(
        'expanded'
    );

    description.classList.add(
        'collapsed'
    );

    setTimeout(() => {

        description.classList.remove(
    'collapsed'
);

description.style.maxHeight =
'none';

const fullHeight =
description.scrollHeight;

description.style.maxHeight =
'';

description.classList.add(
    'collapsed'
);

        const needsExpand =
        fullHeight > 140;

        if(!needsExpand){
            return;
        }

        button.style.display = 'flex';

        button.textContent =
        'Читать далее...';

        button.onclick = (e) => {

            e.preventDefault();

            e.stopPropagation();

            const expanded =
            description.classList.contains(
                'expanded'
            );

            if(expanded){

                description.classList.remove(
                    'expanded'
                );

                description.classList.add(
                    'collapsed'
                );

                button.textContent =
                'Читать далее...';

            }else{

                description.classList.remove(
                    'collapsed'
                );

                description.classList.add(
                    'expanded'
                );

                button.textContent =
                'Скрыть';
            }
        };

    });
}

/* ===================================================== */
/* ================= SWITCH ============================ */
/* ===================================================== */

function nextModernProduct() {
    modernCurrentIndex++;
    if (modernCurrentIndex >= AppState.products.length) {
        modernCurrentIndex = 0;
    }
    animateProductSwitch('next');
}

function prevModernProduct() {
    modernCurrentIndex--;
    if (modernCurrentIndex < 0) {
        modernCurrentIndex = AppState.products.length - 1;
    }
    animateProductSwitch('prev');
}

/* ===================================================== */
/* ================= ANIMATION ========================= */
/* ===================================================== */

function animateProductSwitch(direction = 'next') {
    const modal = document.querySelector('.modern-product-modal');
    if (!modal) return;
    
    const offset = direction === 'next' ? 140 : -140;

    modal.animate(
        [
            { opacity: 1, transform: 'scale(1) translateX(0)', filter: 'blur(0px)' },
            { opacity: 0, transform: `scale(.94) translateX(${offset}px)`, filter: 'blur(12px)' }
        ],
        { duration: 260, easing: 'cubic-bezier(.65,.05,.36,1)' }
    ).onfinish = () => {
        renderModernProduct();

        const modal =
document.querySelector(
    '.modern-product-modal'
    
);

if(modal){

    modal.scrollTo({
        top:0,
        behavior:'instant'
    });
}
        
        modal.animate(
            [
                { opacity: 0, transform: `scale(.94) translateX(${-offset}px)`, filter: 'blur(12px)' },
                { opacity: 1, transform: 'scale(1) translateX(0)', filter: 'blur(0px)' }
            ],
            { duration: 420, easing: 'cubic-bezier(.17,.84,.44,1)' }
        );
    };
}

/* ===================================================== */
/* ================= INFO CARD ========================= */
/* ===================================================== */

function createInfoCard(label, value){

    if(
        value === undefined ||
        value === null ||
        value === '' ||
        value === 'undefined' ||
        value === 'null'
    ){
        return '';
    }

    return `

        <div class="modern-info-card">

            <div class="modern-info-label">

                ${escapeHtml(label)}

            </div>

            <div class="modern-info-value">

                ${escapeHtml(String(value))}

            </div>

        </div>

    `;
}

/* ===================================================== */
/* ================= EVENTS ============================ */
/* ===================================================== */

document.addEventListener('click', (e) => {
    /* CLOSE */
    if (e.target.id === 'modernCloseProductModal' || e.target.id === 'modernProductModalOverlay') {
        closeModernProductModal();
    }
});

/* SWITCH BUTTONS */
document.addEventListener('DOMContentLoaded', () => {
    const prev = document.getElementById('modernPrevBtn');
    const next = document.getElementById('modernNextBtn');

    if (prev) {
        prev.addEventListener('click', (e) => {
            e.stopPropagation();
            prevModernProduct();
        });
    }

    if (next) {
        next.addEventListener('click', (e) => {
            e.stopPropagation();
            nextModernProduct();
        });
    }
});

/* ===================================================== */
/* ================= GLOBAL ============================ */
/* ===================================================== */

window.openModernProductModal = openModernProductModal;
window.nextModernProduct = nextModernProduct;
window.prevModernProduct = prevModernProduct;