const galleryButton = document.getElementById('gallery');
const uploadButton = document.getElementById('upload');
const uploadGalleryInput = document.getElementById('upload-gallery');
const photo = document.getElementById('photo');
const clearButton = document.getElementById('clear');

let imageBlob = null;

galleryButton.addEventListener('click', () => {
    console.log('Gallery button clicked');
    uploadGalleryInput.click();
});

uploadGalleryInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        console.log('File selected:', file.name);
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const canvas = document.getElementById('canvas');
            const context = canvas.getContext('2d');
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(blob => {
                imageBlob = blob;
                photo.src = url;
                photo.style.display = 'block';
                clearButton.style.display = 'inline-block';
                uploadButton.disabled = false;
                console.log('Image loaded and displayed');
            }, 'image/png');
        };
        img.src = url;
    }
});

clearButton.addEventListener('click', () => {
    console.log('Clear button clicked');
    photo.style.display = 'none';
    clearButton.style.display = 'none';
    uploadButton.disabled = true;
    imageBlob = null;
});

uploadButton.addEventListener('click', () => {
    if (imageBlob) {
        console.log('Upload button clicked, starting upload');
        const formData = new FormData();
        formData.append('image', imageBlob, 'captured_image.png');
        
        fetch('/upload', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
          .then(data => {
              console.log('Server response:', data);
              if (data && data.result_text) {
                  const resultText = data.result_text;
                  window.location.href = `/result?result_text=${encodeURIComponent(resultText)}`;
              } else {
                  throw new Error('Resposta inválida do servidor');
              }
          }).catch(error => {
              console.error("Erro ao enviar a imagem: ", error);
          });
    } else {
        console.error("Nenhuma imagem para enviar.");
    }
});
