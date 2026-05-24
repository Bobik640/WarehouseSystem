const ambientContainer = document.querySelector('.ambient-icons');

const icons = [
    'fa-warehouse',
    'fa-box',
    'fa-truck',
    'fa-cubes',
    'fa-boxes-stacked',
    'fa-dolly'
];

function createAmbientIcon(){

    const icon = document.createElement('i');

    const randomIcon =
        icons[Math.floor(Math.random() * icons.length)];

    icon.className =
        `fas ${randomIcon}`;

    /* ===== RANDOM POSITION ===== */

    icon.style.left =
        Math.random() * 100 + 'vw';

    /* ===== RANDOM SIZE ===== */

    const size =
        20 + Math.random() * 50;

    icon.style.fontSize =
        size + 'px';

    /* ===== RANDOM OPACITY ===== */

    icon.style.opacity =
        0.05 + Math.random() * 0.08;

    /* ===== RANDOM DURATION ===== */

    const duration =
        18 + Math.random() * 20;

    icon.style.animationDuration =
        duration + 's';

    /* ===== RANDOM DRIFT ===== */

    const drift =
        (-30 + Math.random() * 60);

    icon.style.setProperty(
        '--drift',
        drift + 'vw'
    );

    ambientContainer.appendChild(icon);

    /* ===== REMOVE ===== */

    setTimeout(() => {

        icon.remove();

    }, duration * 1000);
}

/* ===== SPAWN LOOP ===== */

setInterval(() => {

    for(let i = 0; i < 3; i++){

        createAmbientIcon();
    }

}, 500);