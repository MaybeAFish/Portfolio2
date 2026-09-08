import { overlayManager } from '../interactables/interactable-implementations/overlay-manager.js'
import { sceneManager } from '../sketch.js'

export class Scene {
  constructor() {}
  enter() { // called when scene becomes active
    this.isFinishedEntering();
  }
  isFinishedEntering() {
    sceneManager.isSwitching = false;
  }
  async exit() {} // called when scene leaves
  update(delta) {} // called each frame

  onMenuClose() {} // Called when settings menu opens or worldmap menu closes

  onMenuOpen() {
    // Called when settings menu opens or worldmap menu opens
    overlayManager.closeOverlay(overlayManager.currentOverlay, false);
  }
}