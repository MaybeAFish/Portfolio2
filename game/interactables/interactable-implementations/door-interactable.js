import { Interactable } from './interactable.js';
import { audioManager } from '../../sketch.js';

export class DoorInteractable extends Interactable {
  static soundIndex = 0;

  constructor(position, name, minimapOptions) {
    super(position, name, minimapOptions);
  }

  async init() {
    await this.loadModel('/about/art/models/pickaxe.glb');
  }

  onInteract() {
    audioManager.playGlobalSound('/game/sounds/environment/open-door.mp3');
  }
}