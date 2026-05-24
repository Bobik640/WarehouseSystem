function setupImagePreview(){

    const imageInput =
        document.getElementById(
            'productImage'
        );

    const previewWrapper =
        document.getElementById(
            'imagePreviewWrapper'
        );

    const previewImage =
        document.getElementById(
            'imagePreview'
        );

    if(
        !imageInput ||
        !previewWrapper ||
        !previewImage
    ) return;

    imageInput.addEventListener(
        'change',
        function(){

            const file =
                this.files[0];

            if(!file){

                previewWrapper.style.display =
                    'none';

                return;
            }

            const reader =
                new FileReader();

            reader.onload =
                function(e){

                    previewImage.src =
                        e.target.result;

                    previewWrapper.style.display =
                        'block';
                };

            reader.readAsDataURL(file);
        }
    );
}

document.addEventListener(
    'DOMContentLoaded',
    setupImagePreview
);