import { Interactable } from './interactable.js';
import { audioManager, sceneManager } from '../../sketch.js';

export class ChangeSceneInteractable extends Interactable {
  static soundIndex = 0;

  constructor(position, name, minimapOptions, sceneName) {
    super(position, name, minimapOptions);
    this.sceneName = sceneName;
    this.bindEvents();
  }

  async init() {
    await this.loadModel('/about/art/models/pickaxe.glb');
  }

  bindEvents() {
    // window.addEventListener('keydown', (e) => {
    //   if (e.key.toLowerCase() === 'b') {
    //     this.onInteract();
    //   }
    // });
  }

  onInteract() {
    sceneManager.switchScene(this.sceneName);
    audioManager.playGlobalSound('/game/sounds/effects/teleport-between-scenes.mp3');
  }
}