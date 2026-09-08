import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import { Scene } from './scene.js';

export class StartScene extends Scene {
  constructor(switchScene) {
    super();
    this.switchScene = switchScene;
    this.scene = new THREE.Scene();
  }

  enter() {
    // Start with overlay fade in
    const overlay = document.getElementById('scene-overlay');
    const startContent = document.getElementById('start-scene-content');
    const charSelect = document.getElementById('character-select');

    overlay.style.pointerEvents = 'auto';
    overlay.style.opacity = '1';
    startContent.style.display = 'block';

    // Hide character select after 0.5s
    setTimeout(() => {
      if (charSelect) charSelect.style.display = 'none';
      startContent.style.opacity = '1';
    }, 500);

    // Hook up buttons
    const btnYes = document.getElementById('btn-yes');
    const btnNo = document.getElementById('btn-no');

    btnYes.onclick = () => {
        const audio = new Audio('/game/sounds/ui/tutorial-button.mp3');
        audio.currentTime = 0;
        audio.play();
        this.switchScene('tutorial');
    };

    btnNo.onclick = () => {
        const audio = new Audio('/game/sounds/ui/tutorial-button.mp3');
        audio.currentTime = 0;
        audio.play();
        this.switchScene('game');
    };

    super.enter();
  }

  exit() {
    // Hide overlay + content immediately
    const overlay = document.getElementById('scene-overlay');
    const startContent = document.getElementById('start-scene-content');
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    startContent.style.opacity = '0';
    startContent.style.display = 'none';
  }

  update(delta) {
  }
}
