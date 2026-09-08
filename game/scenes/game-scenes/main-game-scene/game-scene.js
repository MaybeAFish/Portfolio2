import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import { Scene } from '../../scene.js';
import { Player } from '../../../characters/player.js';
import { GameMap } from '../../../characters/GameMap.js';
import { InteractableManager } from '../../../interactables/interactable-manager.js';
import { MapManager } from '/game/map/map-manager.js';
import { GameInteractables } from '../../../interactables/interactable-groups.js';
import { overlayManager } from '../../../interactables/interactable-implementations/overlay-manager.js';
import { FallOffHint } from '../fall-off-hint.js';
import { LoadingProgress } from '../loading-progress.js';

export class GameScene extends Scene {
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

    this.isLoaded = false;
  }

  async enter() {
    const loader = new LoadingProgress;
    loader.showLoadingScreen('Loading scene...');
    await new Promise(r => setTimeout(r, 100));

    document.getElementById('game-container').style.display = 'block';

    loader.updateLoadingScreen('Loading player...', 10);
    this.player = new Player(this.rapierWorld, this.scene);

    loader.updateLoadingScreen('Loading map...', 20);
    this.map = new GameMap(this.rapierWorld);

    loader.updateLoadingScreen('Loading interactables...', 50);
    this.interactableManager = new InteractableManager();
    await this.interactableManager.load(
      this.scene,
      this.player,
      GameInteractables,
      (loaded, total) => {
        const percent = 50 + (loaded / total) * 25;
        loader.updateLoadingScreen(`Loading interactables... (${loaded}/${total})`, percent);
      }
    );

    await this.fallHint.load(this.player);

    loader.updateLoadingScreen('Initializing map manager...', 75);
    this.mapManager = new MapManager(this.player, GameInteractables);
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
    super.enter();
  }

  async exit() {
    if (this.player) {
      await this.player.dispose();
      this.player = null;
    }

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

            const pos = this.player.mesh.position;
            const coordsDiv = document.getElementById('player-coordinates');
            coordsDiv.style.display = 'block';
            coordsDiv.textContent = `(${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)})`;
        }

        this.interactableManager.update(delta, this.camera, this.player);
    }

    this.mapManager.update(delta);
  }
}