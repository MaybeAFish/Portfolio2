const card = document.querySelector('.character-card');
let mouseX = 0, mouseY = 0;
let rotX = 0, rotY = 0;

function updateTilt() {
    rotX += (mouseY - rotX) * 0.1;
    rotY += (mouseX - rotY) * 0.1;

    card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;

    requestAnimationFrame(updateTilt);
}

card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    mouseX = ((x - centerX) / centerX) * 10;
    mouseY = ((centerY - y) / centerY) * 10;
});

card.addEventListener('mouseleave', () => {
    mouseX = 0;
    mouseY = 0;
});

updateTilt();