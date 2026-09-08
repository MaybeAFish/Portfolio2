// import { characterList as characters } from './character-list.js';

// let currentIndex = 0;
// const track = document.getElementById('carousel-track');
// const nameDisplay = document.getElementById('character-name');
// const playButton = document.getElementById('play-button');

// function updateCarousel(direction = 0) {
//   const ordered = [
//     characters[(currentIndex - 1 + characters.length) % characters.length],
//     characters[currentIndex],
//     characters[(currentIndex + 1) % characters.length]
//   ];

//   // TEMP track setup with 3 models
//   track.innerHTML = '';
//   ordered.forEach((char, i) => {
//     const wrapper = document.createElement('div');
//     wrapper.classList.add('character-model');
//     if (i === 1) wrapper.classList.add('selected');
//     wrapper.innerHTML = `
//       <model-viewer src="${char.src}" alt="${char.name}"
//         camera-controls disable-zoom interaction-prompt="none"
//         autoplay animation-name="Idle"></model-viewer>
//     `;
//     track.appendChild(wrapper);
//   });

//   // Animate carousel
  

//   // Update name and play button
//   nameDisplay.textContent = characters[currentIndex].name;
//   playButton.onclick = characters[currentIndex].play;
// }


// function nextChar() {
//   currentIndex = (currentIndex + 1) % characters.length;
//   updateCarousel(1); // slide left
// }

// function prevChar() {
//   currentIndex = (currentIndex - 1 + characters.length) % characters.length;
//   updateCarousel(-1); // slide right
// }

// document.getElementById('next-btn').addEventListener('click', nextChar);
// document.getElementById('prev-btn').addEventListener('click', prevChar);

// document.addEventListener('mousemove', (e) => {
//   document.querySelectorAll('model-viewer').forEach(mv => {
//     const bounds = mv.getBoundingClientRect();
//     const centerX = bounds.left + bounds.width / 2;
//     const deltaX = e.clientX - centerX;
//     mv.cameraOrbit = `${-deltaX * 0.05}deg 75deg auto`;
//   });
// });

// updateCarousel();