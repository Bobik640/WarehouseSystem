// ===== ЗОНА ЗАГРУЗКИ ФАЙЛОВ =====

const uploadZone = document.getElementById('uploadZone');
const imageInput = document.getElementById('productImage');

if (uploadZone && imageInput) {
    uploadZone.addEventListener('click', () => {
        if (!AppState.isLoggedIn) return;
        imageInput.removeAttribute('disabled');
        imageInput.click();
    });
    
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });
    
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        if (!AppState.isLoggedIn) return;
        
        const file = e.dataTransfer.files[0];
        if (file) {
            imageInput.files = e.dataTransfer.files;
            imageInput.dispatchEvent(new Event('change'));
        }
    });
}