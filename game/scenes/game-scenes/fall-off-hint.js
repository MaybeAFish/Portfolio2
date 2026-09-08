import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

export class FallOffHint {
  constructor(yThreshold) {
    this.yThreshold = yThreshold;
    this.player = null;
    this.activated = false;
    this.div = null;
  }

  async load(player) {
    this.player = player;

    // Create the div
    this.div = document.createElement('div');
    this.div.textContent = "Let's try not falling off the map! 😊";
    this.div.style.position = 'fixed';
    this.div.style.top = '50%';
    this.div.style.left = '50%';
    this.div.style.transform = 'translate(-50%, -50%)';
    this.div.style.fontSize = '32px';
    this.div.style.color = 'white';
    this.div.style.padding = '20px 40px';
    this.div.style.borderRadius = '20px';
    this.div.style.backgroundColor = 'rgba(100, 100, 100, 0.9)';
    this.div.style.opacity = '0';
    this.div.style.transition = 'opacity 1s ease';
    this.div.style.pointerEvents = 'none';
    this.div.style.zIndex = '9999';

    document.body.appendChild(this.div);
  }

  update() {
    if (!this.player || this.activated) return;

    const pos = this.player.mesh.position;
    if (pos.y < this.yThreshold) {
      this.activated = true;
      this.div.style.opacity = '1';
      this.player.setPosition(0, 5, 0);

      setTimeout(() => {
        this.div.style.opacity = '0';
      }, 3000); // Fade out after 3 seconds
    }
  }
}
