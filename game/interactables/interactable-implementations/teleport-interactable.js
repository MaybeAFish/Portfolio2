import { Interactable } from './interactable.js';
import { audioManager } from '../../sketch.js';

export class TeleportInteractable extends Interactable {
  static soundIndex = 0;

  constructor(position, name, minimapOptions, targetPosition, player) {
    super(position, name, minimapOptions);
    this.targetPosition = targetPosition;
    this.player = player;

    this.teleportSounds = [
      '/game/sounds/effects/teleport1.mp3',
      '/game/sounds/effects/teleport2.mp3',
      '/game/sounds/effects/teleport3.mp3',
    ];
  }

  async init() {
    await this.loadModel('/about/art/models/pickaxe.glb');
  }

  onInteract() {
    this.player.mesh.position.copy(this.targetPosition);

    const sound = this.teleportSounds[TeleportInteractable.soundIndex];
    TeleportInteractable.soundIndex = (TeleportInteractable.soundIndex + 1) % this.teleportSounds.length;

    audioManager.playGlobalSound(sound);
  }
}