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
    document.getElementById('game-container').style.display = 'block';

    const loader = new LoadingProgress();
    loader.addStep('Player', 1);
    loader.addStep('Map', 2);
    loader.addStep('World Interactions', 3);
    loader.addStep('Map UI', 2);
    loader.addStep('Opening the map...', 1);
    loader.showLoadingScreen();

    // Player
    this.player = new Player(this.rapierWorld, this.scene);
    await new Promise((resolve) => {
      this.player.load((loadedChar) => {
        this.scene.add(this.player.mesh);
        resolve();
      });
    });
    this.player.setPosition(0, 5, 0);
    loader.markDone('Player');
    await new Promise(r => setTimeout(r, 50));

    // Map
    this.map = new GameMap(this.rapierWorld);
    await this.fallHint.load(this.player);
    await this.map.load(this.scene);
    loader.markDone('Map');
    await new Promise(r => setTimeout(r, 50));

    // World Interactions
    this.interactableManager = new InteractableManager();
    await this.interactableManager.load(
      this.scene,
      this.player,
      GameInteractables,
      (loaded, total) => {
        loader.update(
          'World Interactions',
          loaded / total,
          `World Interactions (${loaded}/${total})`
        );
      }
    );
    loader.markDone('World Interactions');
    await new Promise(r => setTimeout(r, 50));

    // Map UI
    this.mapManager = new MapManager(this.player, GameInteractables);
    await this.mapManager.load((completed, total, label) => {
      loader.update('Map UI', completed / total);
    });
    loader.markDone('Map UI');
    await new Promise(r => setTimeout(r, 50));

    // Opening the map
    loader.markDone('Opening the map...');
    await new Promise(r => setTimeout(r, 10));

    // Done
    this.isLoaded = true;
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