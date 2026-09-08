import { Minimap } from '/game/map/minimap/minimap.js';
import { WorldMap } from '/game/map/world-map/world-map.js';
import { audioManager, sceneManager } from '../sketch.js';
import { InteractButton } from '../interactables/interactable-manager.js';
import { inputManager } from '../core/input-manager.js';

export class MapManager {
  constructor(player, interactables) {
    this.player = player;
    this.interactables = interactables;
    this.mapOpen = false;

    // Setup UI bindings
    this._toggleMapHandler = this.toggleMap.bind(this);
    document.getElementById('map-toggle').addEventListener('click', this._toggleMapHandler);
    document.getElementById('close-map-btn').addEventListener('click', this._toggleMapHandler);
  }

  async load(callback = () => {}) {
    const totalSteps = 2;
    let completed = 0;

    this.minimap = new Minimap(this.player, 'minimap-canvas', this.interactables);
    await this.minimap.load((l, t, label) => {
      const percent = (l / t) * (100 / totalSteps);
      callback(completed + percent / 100, totalSteps, label);
    });
    completed++;

    this.worldMap = new WorldMap(this.player, 'full-map-canvas', this.interactables);
    await this.worldMap.load((l, t, label) => {
      const percent = (l / t) * (100 / totalSteps);
      callback(completed + percent / 100, totalSteps, label);
    });
    completed++;
  }


  dispose() {
    document.getElementById('map-toggle').removeEventListener('click', this._toggleMapHandler);
    document.getElementById('close-map-btn').removeEventListener('click', this._toggleMapHandler);
    this.minimap.dispose();
    this.worldMap.dispose();
  }

  toggleMap() {
    this.mapOpen = !this.mapOpen;
    if (this.mapOpen) {
      this.showWorldMap();
      audioManager.playGlobalSound('/game/sounds/ui/map-open.mp3');
      InteractButton.style.display = 'none';
    } else {
      this.showGame();
      audioManager.playGlobalSound('/game/sounds/ui/map-close.mp3');
    }
  }

  showGame() {
    document.getElementById('minimap-container').style.display = 'block';
    document.getElementById('full-map-overlay').style.display = 'none';
    sceneManager.currentScene.onMenuClose();
  }

  showWorldMap() {
    document.body.style.cursor = 'default';
    document.getElementById('full-map-overlay').style.display = 'block';
    document.getElementById('minimap-container').style.display = 'none';
    this.worldMap.resetView();
    sceneManager.currentScene.onMenuOpen();
  }


  update(deltaTime) {
    if (inputManager.keysPressed[inputManager.bindings.map]) {
      this.toggleMap();
    }

    if (!this.mapOpen) {
      this.minimap.update(deltaTime);
    } else {
      this.worldMap.update(deltaTime);
    }
  }

  isMapOpen() {
    return this.mapOpen;
  }
}