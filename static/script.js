const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');
const openCameraButton = document.getElementById('open-camera');
const galleryButton = document.getElementById('gallery');
const uploadButton = document.getElementById('upload');
const uploadGalleryInput = document.getElementById('upload-gallery');
const photo = document.getElementById('photo');
const clearButton = document.getElementById('clear');

let stream = null;

openCameraButton.addEventListener('click', () => {
    if (!stream) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(cameraStream => {
                stream = cameraStream;
                video.srcObject = stream;
                video.play();
                captureButton.style.display = 'inline-block';
                openCameraButton.disabled = true; // Desabilitar o botão "Câmera do Dispositivo" após a abertura da câmera
            })
            .catch(err => {
                console.error("Erro ao acessar a câmera: ", err);
            });
    }
});

captureButton.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/png');
    photo.src = dataURL;
    photo.style.display = 'block';
    clearButton.style.display = 'inline-block';
    uploadButton.disabled = false;
    captureButton.style.display = 'none'; // Ocultar o botão "Capturar Imagem" após a captura
    openCameraButton.disabled = false; // Habilitar o botão "Câmera do Dispositivo" novamente
    if (stream) {
        stream.getTracks().forEach(track => track.stop()); // Encerrar o acesso à câmera após a captura da imagem
        stream = null;
    }
});

galleryButton.addEventListener('click', () => {
    uploadGalleryInput.click();
});

uploadGalleryInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const context = canvas.getContext('2d');
                context.drawImage(img, 0, 0, canvas.width, canvas.height);
                const dataURL = canvas.toDataURL('image/png');
                photo.src = dataURL;
                photo.style.display = 'block';
                clearButton.style.display = 'inline-block';
                uploadButton.disabled = false;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

clearButton.addEventListener('click', () => {
    photo.style.display = 'none';
    clearButton.style.display = 'none';
    uploadButton.disabled = true;
    if (captureButton.style.display === 'inline-block') {
        captureButton.style.display = 'none'; // Ocultar o botão "Capturar Imagem" se estiver visível ao limpar a foto
    }
    openCameraButton.disabled = false; // Habilitar o botão "Câmera do Dispositivo" novamente
    if (stream) {
        stream.getTracks().forEach(track => track.stop()); // Encerrar o acesso à câmera após limpar a foto
        stream = null;
    }
});

uploadButton.addEventListener('click', () => {
    const dataURL = canvas.toDataURL('image/png');

    fetch('/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'image': dataURL,
            'text': 'Texto fixo aqui' // Texto fixo
        })
    }).then(response => response.json())
      .then(data => {
          console.log(data);
      }).catch(error => {
          console.error("Erro ao enviar a imagem: ", error);
      });
});
