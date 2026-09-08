import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import { Scene } from '../../scene.js';
import { Player } from '../../../characters/player.js';
import { TutorialMap } from '../../../characters/tutorial-map.js';
import { InteractableManager } from '../../../interactables/interactable-manager.js';
import * as RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';
import { MapManager } from '/game/map/map-manager.js';
import { TutorialInteractables } from '../../../interactables/interactable-groups.js';
import { GifTutorialZone, TextTutorialZone, ArrowTutorialZone, } from './trigger-zone-implementations.js';
import { audioManager } from '../../../sketch.js';
import { overlayManager } from '../../../interactables/interactable-implementations/overlay-manager.js';
import { FallOffHint } from '../fall-off-hint.js';
import { LoadingProgress } from '../loading-progress.js';

export class TutorialScene extends Scene {
  constructor(rapierWorld, camera) {
    super();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xaaddff);

    this.rapierWorld = rapierWorld;
    this.camera = camera;

    this.clock = new THREE.Clock();

    this.player = null;
    this.map = null;
    this.mapManager = null;
    this.interactableManager = null;
    this.fallHint = new FallOffHint(-20);

    this.tutorialZones = [];

    this.isLoaded = false;

    this.box = document.getElementById('tutorial-box');
  }

  async enter() {
    const loader = new LoadingProgress;
    loader.showLoadingScreen('Loading scene...');
    await new Promise(r => setTimeout(r, 100));

    document.getElementById('game-container').style.display = 'block';

    loader.updateLoadingScreen('Loading player...', 10);
    this.player = new Player(this.rapierWorld, this.scene);


    loader.updateLoadingScreen('Loading map...', 20);
    this.map = new TutorialMap(this.rapierWorld);

    loader.updateLoadingScreen('Creating tutorial zones...', 30);
    this.tutorialZones = [
      new GifTutorialZone(this.scene, new THREE.Vector3(0, -5, 0), new THREE.Vector3(25, 20, 25), 'Use WASD to move', '/game/scenes/game-scenes/tutorial-scene/tutorial-wasd.gif', this.rapierWorld),

      new GifTutorialZone(this.scene, new THREE.Vector3(0, -5, -40), new THREE.Vector3(30, 20, 30), 'Grab to rotate camera', '/game/scenes/game-scenes/tutorial-scene/tutorial-camera.gif', this.rapierWorld),

      new GifTutorialZone(this.scene, new THREE.Vector3(50, 0, -50), new THREE.Vector3(30, 40, 30), 'Press spacebar to jump', '/game/scenes/game-scenes/tutorial-scene/tutorial-jump.gif', this.rapierWorld),

      new GifTutorialZone(this.scene, new THREE.Vector3(80, 0, -50), new THREE.Vector3(10, 40, 10), 'Jump again whilst mid-air', '/game/scenes/game-scenes/tutorial-scene/tutorial-double-jump.gif', this.rapierWorld),

      // new ArrowTutorialZone(this.scene, new THREE.Vector3(20, -8, 0), new THREE.Vector3(10, 6, 10), new THREE.Vector3(30, 3, 0), this.rapierWorld),

      // new TextTutorialZone(this.scene, new THREE.Vector3(25, -8, 0), new THREE.Vector3(10, 6, 10), 'Press [M] to open the world map and look for a way out', this.rapierWorld),
    ];

    loader.updateLoadingScreen('Loading interactables...', 50);
    this.interactableManager = new InteractableManager();
    await this.interactableManager.load(
      this.scene,
      this.player,
      TutorialInteractables,
      (loaded, total) => {
        const percent = 50 + (loaded / total) * 25; // From 60% to 75%
        loader.updateLoadingScreen(`Loading interactables... (${loaded}/${total})`, percent);
      }
    );

    await this.fallHint.load(this.player);

    loader.updateLoadingScreen('Initializing map manager...', 75);
    this.mapManager = new MapManager(this.player, TutorialInteractables);
    this.mapManager.load((completed, total, label) => {
      const percent = 75 + (completed / total) * 20; // 75–85%
      loader.updateLoadingScreen(`${label} (${Math.round((completed / total) * 100)}%)`, percent);
    });


    loader.updateLoadingScreen('Loading player...', 95);
    await new Promise((resolve) => {
        this.player.load((loadedChar) => {
          this.scene.add(this.player.mesh);
          resolve();
        });
    });

    loader.updateLoadingScreen('Finalizing...', 100);
    await this.map.load(this.scene);

    this.isLoaded = true;

    await new Promise(r => setTimeout(r, 100));// Delay so player can see whatsup
    loader.hideLoadingScreen();
    this.showTutorialUI();

    super.enter();
  }

  async exit() {
    if (this.player) {
      await this.player.dispose();
      this.player = null;
    }

    this.hideTutorialUI();
    
    this.interactableManager.dispose();

    this.mapManager.dispose();

    await this.map.dispose(this.scene);

    this.scene.clear();
    this.isLoaded = false;
  }

  update(delta) {
    if (!this.isLoaded) return;

    if (!this.mapManager?.isMapOpen()) {
      if (overlayManager.currentOverlay == null) {
        this.rapierWorld.step();

        this.player.update(delta);

        this.fallHint.update();

        for (const zone of this.tutorialZones) zone.check(this.player);

        const pos = this.player.mesh.position;
        const coordsDiv = document.getElementById('player-coordinates');
        coordsDiv.style.display = 'block';
        coordsDiv.textContent = `(${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)})`;
      }

      this.interactableManager.update(delta, this.camera, this.player);
    } else {
      this.hideTutorialUI();
    }

    this.mapManager.update(delta);
  }

  showTutorialUI() { this.box.style.opacity = '100%'; }
  hideTutorialUI() { this.box.style.opacity = '0%'; }

  onMenuClose() {
    this.showTutorialUI();
  }

  onMenuOpen() {
    super.onMenuOpen();
    this.hideTutorialUI();
  }
}




export function showTutorialBox(text, imageUrl = null) {
  const box = document.getElementById('tutorial-box');
  const textEl = document.getElementById('tutorial-text');
  const imgEl = document.getElementById('tutorial-image');

  textEl.textContent = text;

  if (imageUrl) {
    imgEl.src = '';
    imgEl.src = imageUrl;
    imgEl.style.display = 'block';
  } else {
    imgEl.style.display = 'none';
  }

  box.style.display = 'flex';

  audioManager.playGlobalSound('/game/sounds/ui/show-tutorial-popup.mp3');
}

export function hideTutorialBox() {
  const box = document.getElementById('tutorial-box');
  box.style.display = 'none';
}