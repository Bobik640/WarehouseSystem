// ===== ПРЕДПРОСМОТР ИЗОБРАЖЕНИЯ =====

function setupImagePreview() {
    const imageInput = document.getElementById('productImage');
    const previewWrapper = document.getElementById('imagePreviewWrapper');
    const previewImage = document.getElementById('imagePreview');
    
    if (!imageInput || !previewWrapper || !previewImage) return;
    
    imageInput.addEventListener('change', () => {
        const file = imageInput.files[0];
        
        if (!file) {
            previewWrapper.style.display = 'none';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewWrapper.style.display = 'block';
        };
        reader.readAsDataURL(file);
    });
}

window.setupImagePreview = setupImagePreview;