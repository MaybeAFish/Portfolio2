import { startGame } from '../sketch.js';

const playButton = document.getElementById('play-button');
const audio = new Audio('/game/sounds/ui/play-game-button.mp3');
playButton.onclick = () => {
  audio.play();
  audio.volume = 0.8; 
  startGame();
};
