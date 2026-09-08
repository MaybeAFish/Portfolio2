import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import { interactables } from '/game/interactables/interactable-manager.js';

export class Minimap {
  constructor(player, canvasId) {
    this.player = player;
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.arrowImg = document.getElementById('minimap-arrow');
    this.minimap  = document.getElementById('minimap-itself');

    // Minimap radius in world units
    this.radius = 20;
    // How many world units = 100px on minimap
    this.scale = this.canvas.width / (this.radius * 2);

    // Center of minimap (in pixels)
    this.cx = this.canvas.width / 2;
    this.cy = this.canvas.height / 2;

    // Preload images
    this.iconElements = [];
    this.iconCache = new Map();

    this.itemVisibilityMap = new Map();
    for (const item of interactables) {
      this.itemVisibilityMap.set(item.name, true);
    }
  }

  async load(callback = () => {}) {
    const itemsWithIcons = interactables.filter(i => i.options.icon);
    const total = itemsWithIcons.length;
    let loaded = 0;

    for (const item of itemsWithIcons) {
      const iconUrl = item.options.icon;
      if (!this.iconCache.has(iconUrl)) {
        const img = new Image();
        img.src = iconUrl;

        await new Promise((resolve) => {
          img.onload = () => {
            this.iconCache.set(iconUrl, img);
            loaded++;
            callback(loaded, total, 'Loading minimap icons...');
            resolve();
          };
          img.onerror = resolve;
        });
      }
    }

    this.createMinimapItems();
  }

  dispose() {
    console.log("penis")
    for (const { wrapper } of this.iconElements) {
      if (wrapper && wrapper.parentNode) {
        wrapper.parentNode.removeChild(wrapper);
      }
    }
    this.iconElements = [];
  }

  createMinimapItems() {
    for (const item of interactables) {
      const wrapper = document.createElement('div');
      wrapper.style.position = 'absolute';
      wrapper.style.width = '20px';
      wrapper.style.height = '20px';
      wrapper.style.borderRadius = '50%';
      wrapper.style.backgroundColor = item.options.color || 'black';
      wrapper.style.display = 'flex';
      wrapper.style.justifyContent = 'center';
      wrapper.style.alignItems = 'center';
      wrapper.style.transform = 'translate(-50%, -50%)';
      wrapper.style.pointerEvents = 'none';

      const img = document.createElement('img');
      img.src = item.options.icon;
      img.style.width = '14px';
      img.style.height = '14px';
      img.style.imageRendering = 'pixelated';
      img.style.pointerEvents = 'none';

      wrapper.appendChild(img);
      document.getElementById('minimap-icons-container').appendChild(wrapper);

      this.iconElements.push({ item, wrapper });
    }
  }

  update(deltaTime) {
    if (!this.player || !this.player.mesh) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Save context and clip to circle for background and grid
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.cx, this.cy, this.canvas.width / 2, 0, Math.PI * 2);
    this.ctx.clip();

    // Draw minimap background
    this.ctx.fillStyle = 'rgba(50,50,50,0.6)';
    this.ctx.fill();

    this.ctx.strokeStyle = 'rgba(200,200,200,0.2)';
    this.ctx.lineWidth = 1;
    const step = 10;
    const radius = 500;
    for (let x = -radius; x <= radius; x += step) {
        // subtract player position to keep grid fixed on (0,0)
        const px = this.cx + (x - this.player.mesh.position.x) * this.scale;
        this.ctx.beginPath();
        this.ctx.moveTo(px, 0);
        this.ctx.lineTo(px, this.canvas.height);
        this.ctx.stroke();
    }
    for (let z = -radius; z <= radius; z += step) {
        const pz = this.cy + (z - this.player.mesh.position.z) * this.scale;
        this.ctx.beginPath();
        this.ctx.moveTo(0, pz);
        this.ctx.lineTo(this.canvas.width, pz);
        this.ctx.stroke();
    }

    this.ctx.restore();

    const camDeg = THREE.MathUtils.radToDeg(this.player.cameraHeading);

    // Draw each interactable icon, clamped on edge
    for (const { item, wrapper } of this.iconElements) {
      if (!this.itemVisibilityMap.get(item.name)) {
        wrapper.style.display = 'none';
        continue;
      }
      
      const relX = item.mesh.position.x - this.player.mesh.position.x;
      const relZ = item.mesh.position.z - this.player.mesh.position.z;

      const dist = Math.sqrt(relX * relX + relZ * relZ);
      if (dist === 0) {
        wrapper.style.display = 'none';
        continue;
      }

      const dirX = relX / dist;
      const dirZ = relZ / dist;
      const clampedDist = Math.min(dist, this.radius);

      const px = this.cx + dirX * clampedDist * this.scale;
      const pz = this.cy + dirZ * clampedDist * this.scale;

      // Only show if within radius (icon center must be inside)
      wrapper.style.display = 'flex';
      wrapper.style.left = `${px}px`;
      wrapper.style.top = `${pz}px`;

      const baseTransform = `translate(-50%, -50%)`;

      if (item.name === 'Watch Me Play') {
        const dx = this.cx - px;
        const dy = this.cy - pz;
        const angleToCenter = Math.atan2(dy, dx)  - Math.PI / 2;;
        wrapper.style.transform = `${baseTransform} rotate(${angleToCenter}rad)`;
      } else {
        wrapper.style.transform = `${baseTransform} rotate(${-camDeg + 90}deg)`;
      }
    }

    // Rotate arrow to match camera heading
    const deg = THREE.MathUtils.radToDeg(this.player.playerHeading);
    this.arrowImg.style.transform = `translate(-50%, -50%) rotate(${-deg}deg)`;
    this.minimap.style.transform = `rotate(${(camDeg - 90)}deg)`;
  }

  setItemVisibility(item, visible) {
    this.itemVisibilityMap.set(item.name, visible);
  }
}