import { overlayManager } from '../interactables/interactable-implementations/overlay-manager.js'
import { sceneManager } from '../sketch.js'

export class Scene {
  constructor() {
    this.HUD = {
      tutorialBox: document.getElementById('tutorial-box'),
      minimap: document.getElementById('minimap-container'),
      settings: document.getElementById('settings-button'),
    };
  }
  enter() { // called when scene becomes active
    this.isFinishedEntering();
  }
  isFinishedEntering() {
    sceneManager.isSwitching = false;
  }
  async exit() {} // called when scene leaves
  update(delta) {} // called each frame

  // Called when settings menu opens or worldmap menu closes
  onMenuClose() {
    this.showUI();
  }

  // Called when settings menu opens or worldmap menu opens
  onMenuOpen() {
    overlayManager.closeOverlay(overlayManager.currentOverlay, false);
    this.hideUI();
  }

  hideUI() { 
    Object.values(this.HUD).forEach(element => {
      element.style.display = 'none';
    });
  }
  showUI() {
    Object.values(this.HUD).forEach(element => {
      element.style.display = 'flex';
    });
  }
}