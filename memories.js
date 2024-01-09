let imgLen = 12;
let isMouseMoveEnabled = true;


function render() {
    createGallery();
    setMouseMove();

}


function createGallery() {
    let gallery = document.getElementById('gallery');
    gallery.innerHTML = '';
    for (let i = 0; i < imgLen; i++) { gallery.innerHTML += templateGalleryHTML(i + 1); } 
}


function setMouseMove() {
    const images = document.querySelectorAll('.gallery img');

    document.addEventListener('mousemove', (event) => {
        if (isMouseMoveEnabled && window.innerWidth > 640) {
            let { clientX, clientY } = event;
            let percentX = calcPercent(clientX, window.innerWidth);
            let percentY = calcPercent(clientY, window.innerHeight);
            images.forEach((image) => moveImageBackground(image, percentX, percentY));
        }
    });
}


function calcPercent(clientCoord, windowSize) { return (clientCoord / windowSize) * 100 }


function moveImageBackground(image, percentX, percentY) { image.style.objectPosition = `${percentX}% ${percentY}%`; }


function openImg(idx) {
    isMouseMoveEnabled = false;
    document.getElementById('image-popup-container').classList.remove('d-none');
    document.body.style.overflow = 'hidden';
    document.activeElement.blur();
    let popup = document.getElementById('image-popup-container');
    popup.innerHTML = templateOpenImg(idx); 
    document.addEventListener('click', closeImg);
    isMouseMoveEnabled = true;
}

function closeImg(event) {
    let imgPopupCon = document.getElementById('image-popup-container');
    let imgPopup = document.getElementById('image-popup');
     if (imgPopupCon.contains(event.target) && !imgPopup.contains(event.target)) {
        document.getElementById('image-popup-container').classList.add('d-none');
        document.body.style.overflow = 'auto';
    }
}


function previousImg(idx) { 
    if (idx == 1) { openImg(imgLen); }
    else { openImg(idx - 1); }
}

function nextImg(idx) { 
    if (idx == imgLen) { openImg(1); }
    else { openImg(idx  + 1); }
}


function templateGalleryHTML(idx) { return /*html*/` <img onclick="openImg('${idx}')" src="./img/${idx}.jpg" alt="">`; }


function templateOpenImg(idx) {
    return /*html*/`
        <div id="image-popup" class="image-popup">
            <img class="open-img" src="./img/${idx}.jpg" alt=""> 
            <div class="arrow-container">
                <img  onclick="previousImg(${idx})" class="arrows" src="./icons/arrow_backward.png" alt="">
                <img onclick="nextImg(${idx})" class="arrows" src="./icons/arrow_forward.png" alt="">
            </div>
        </div>
        <div class="img-text">
            <p>Bild ${idx} von ${imgLen} </p>
        </div>
        `;
}
