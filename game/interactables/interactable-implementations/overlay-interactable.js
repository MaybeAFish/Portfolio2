import { Interactable } from './interactable.js';
import { audioManager } from '../../sketch.js';
import { overlayManager } from './overlay-manager.js';

export class OverlayInteractable extends Interactable {
  constructor(position, name, minimapOptions, contentNode) {
    super(position, name, minimapOptions);
    this.contentNode = contentNode;
  }

  async init() {
    await this.loadModel('/about/art/models/pickaxe.glb');
  }

  onInteract() {
    const existing = document.getElementById(this.name);
    if (existing) {
      overlayManager.closeOverlay(existing);
    } else {
      overlayManager.openOverlay(this.name, this.contentNode.cloneNode(true));
    }
  }

  onWalkTooFar() {
    if (this.isOverlayOpen()) {
      const el = document.getElementById(this.name);
      if (el) overlayManager.closeOverlay(el);
    }
  }

  isOverlayOpen() {
    return overlayManager.currentOverlay?.id === this.name;
  }
}