import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import { audioManager } from '../../sketch.js';
import { interactables } from '/game/interactables/interactable-manager.js';

export class WorldMap {
  constructor(player, canvasId, interactablesGroups) {
    this.player = player;
    this.interactables = [];
    this.interactablesGroups = interactablesGroups;

    this.minimap;
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.arrowImg = document.getElementById('world-map-arrow');
    this.arrowImg.style.scale = '1';

    this.scale = 1;
    this.zoomScale = 10; // How many world units = 100px on map
    this.cx = this.canvas.width / 2;
    this.cy = this.canvas.height / 2;

    // Zoom
    this.zoom = 2;
    this.minZoom = 0.25;
    this.maxZoom = 10;
    this.canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomSpeed = 0.1;
        this.zoom -= e.deltaY * zoomSpeed * 0.01;
        this.zoom = Math.min(this.maxZoom, Math.max(this.minZoom, this.zoom));
        this.scale = this.zoomScale * this.zoom;  
    });

    // Dragging
    this.isDragging = false;
    this.lastMouse = { x: 0, y: 0 };
    this.canvas.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.lastMouse.x = e.clientX;
        this.lastMouse.y = e.clientY;
        document.body.style.cursor = 'grabbing';
    });

    this.canvas.addEventListener('mouseup', () => {
        this.isDragging = false;
        document.body.style.cursor = 'default';
    });

    this.canvas.addEventListener('mouseleave', () => {
        this.isDragging = false;
        document.body.style.cursor = 'default';
    });

    this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;

        if (this.isDragging) {
            const dx = e.clientX - this.lastMouse.x;
            const dy = e.clientY - this.lastMouse.y;
            this.cx += dx;
            this.cy += dy;
            this.lastMouse.x = e.clientX;
            this.lastMouse.y = e.clientY;
        }

        this.updateLegendRotation();
    });


    // Flatten interactables and add group reference
    this.groupVisibility = {};
    for (const [groupName, items] of Object.entries(this.interactablesGroups)) {
      this.groupVisibility[groupName] = true;
      for (const item of items) {
        item.groupName = groupName;
        item.visible = true;
        this.interactables.push(item);
      }
    }

    this.iconCache = new Map();


    this.mouse = { x: 0, y: 0 };
    this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
    });
    this.canvas.addEventListener('mousemove', () => {
        this.updateLegendRotation();
    });

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

    async load(callback = () => {}) {
        const itemsWithIcons = this.interactables.filter(i => i.options?.icon);
        const total = itemsWithIcons.length;
        let loaded = 0;

        for (const item of itemsWithIcons) {
            const iconUrl = item.options.icon;
            if (!this.iconCache.has(iconUrl)) {
            const img = document.createElement('img');
            const container = document.getElementById('full-map-overlay');
            container.appendChild(img);

            img.src = iconUrl;
            img.classList.add('map-icon');
            img.style.position = 'absolute';
            img.style.width = '32px';
            img.style.height = '32px';
            img.style.pointerEvents = 'none';

            await new Promise((resolve) => {
                img.onload = () => {
                this.iconCache.set(iconUrl, img);
                loaded++;
                callback(loaded, total, 'Loading world map icons...');
                resolve();
                };
                img.onerror = resolve;
            });
            }
        }

        this.populateLegend();
    }

    dispose() {
        for (const img of this.iconCache.values()) {
            if (img && img.parentNode) {
            img.parentNode.removeChild(img);
            }
        }
        this.iconCache.clear();
    }

    resetView() {
        // Reset the view to the center of the canvas when the map is opened
        this.cx = this.canvas.width / 2;
        this.cy = this.canvas.height / 2;
        this.zoom = 2;
        this.scale = this.zoomScale * this.zoom;
        this.isDragging = false;
        this.lastMouse = { x: 0, y: 0 };
        this.mouse = { x: 0, y: 0 };
        this.updateLegendRotation();
    }

    update(deltaTime) {
        if (!this.player?.mesh) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
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

        for (const item of this.interactables) {
            if (!item.visible || !this.groupVisibility[item.groupName]) {
                const img = this.iconCache.get(item.options.icon);
                if (img) img.style.display = 'none';
                continue;
            }

            // Decide position
            const px = this.cx + (item.position.x - this.player.mesh.position.x) * this.scale;
            const pz = this.cy + (item.position.z - this.player.mesh.position.z) * this.scale;

            const iconBackground = 20;
            const iconSize = 32;

            this.ctx.fillStyle = item.options.color || 'red';
            this.ctx.beginPath();
            this.ctx.arc(px, pz, iconBackground, 0, Math.PI * 2);
            this.ctx.fill();

            const screenX = this.cx + (item.position.x - this.player.mesh.position.x) * this.scale;
            const screenY = this.cy + (item.position.z - this.player.mesh.position.z) * this.scale;

            const img = this.iconCache.get(item.options.icon);
            img.style.display = 'block';
            img.style.left = `${screenX}px`;
            img.style.top = `${screenY}px`;

            if (item.name === 'Watch Me Play') {
                // Get mouse coordinates relative to the page
                const mouseX = this.mouse.x + this.canvas.getBoundingClientRect().left;
                const mouseY = this.mouse.y + this.canvas.getBoundingClientRect().top;

                // Compute angle from icon center to mouse
                const dx = mouseX - screenX;
                const dy = mouseY - screenY;
                const angleRad = Math.atan2(dy, dx)  - Math.PI / 2;; // no -PI/2 needed now

                const deg = angleRad * (180 / Math.PI);
                img.style.transform = `translate(-50%, -50%) rotate(${deg}deg)`;
            } else {
                img.style.transform = `translate(-50%, -50%)`;
            }

        }

        // Center the arrow image on the player's position, accounting for scale and map center
        const px = this.cx;
        const pz = this.cy;
        const deg = THREE.MathUtils.radToDeg(this.player.playerHeading);
        
        this.arrowImg.style.left = `${px}px`;
        this.arrowImg.style.top = `${pz}px`;
        this.arrowImg.style.transform = `translate(-50%, -50%) rotate(${-deg}deg)`;
    }

    populateLegend() {
        const container = document.querySelector('.world-map-legend');
        container.innerHTML = '';

        for (const [groupName, items] of Object.entries(this.interactablesGroups)) {
            const groupDiv = document.createElement('div');
            groupDiv.classList.add('legend-group');

            // Group header (acts as a button)
            const header = document.createElement('div');
            header.classList.add('legend-group-header');

            const groupCheckbox = document.createElement('input');
            groupCheckbox.type = 'checkbox';
            groupCheckbox.checked = true;
            groupCheckbox.style.width = '18px';
            groupCheckbox.style.height = '18px';
            groupCheckbox.style.pointerEvents = 'none'; // disable direct click on checkbox

            const title = document.createElement('h3');
            title.textContent = groupName;
            title.style.margin = '0';

            header.appendChild(groupCheckbox);
            header.appendChild(title);
            groupDiv.appendChild(header);

            const list = document.createElement('ul');
            list.style.listStyle = 'none';
            list.style.padding = '0';

            const itemCheckboxes = [];

            for (const item of items) {
            const li = document.createElement('li');
            li.classList.add('legend-item');

            const itemCheckbox = document.createElement('input');
            itemCheckbox.type = 'checkbox';
            itemCheckbox.checked = true;
            itemCheckbox.style.width = '18px';
            itemCheckbox.style.height = '18px';
            itemCheckbox.style.pointerEvents = 'none'; // disable direct click on checkbox
            itemCheckboxes.push(itemCheckbox);

            // Item row click toggles checkbox
            li.addEventListener('click', () => {
                itemCheckbox.checked = !itemCheckbox.checked;
                itemCheckbox.dispatchEvent(new Event('change'));
                if (itemCheckbox.checked) {
                    audioManager.playGlobalSound('/game/sounds/ui/legenda-item-on.mp3');
                } else {
                    audioManager.playGlobalSound('/game/sounds/ui/legenda-item-off.mp3');
                }
            });

            // Dot with icon
            const dot = document.createElement('div');
            dot.classList.add('legend-dot');
            dot.style.backgroundColor = item.options.color || 'red';

            const icon = document.createElement('img');
            icon.src = item.options.icon;
            dot.appendChild(icon);

            const text = document.createElement('span');
            let name = item.worldMapName ?? item.name;
            text.textContent = name;
            text.style.fontSize = '16px';
            text.style.fontWeight = '500';

            li.appendChild(itemCheckbox);
            li.appendChild(dot);
            li.appendChild(text);
            list.appendChild(li);

            // Update item visibility when checkbox changes
            itemCheckbox.addEventListener('change', () => {
                item.visible = itemCheckbox.checked;
                this.minimap?.setItemVisibility(item, item.visible);

                if (itemCheckbox.checked) {
                    groupCheckbox.checked = true;
                    this.groupVisibility[groupName] = true;
                }
            });
            }

            // Group header click toggles group checkbox
            header.addEventListener('click', () => {
                groupCheckbox.checked = !groupCheckbox.checked;
                groupCheckbox.dispatchEvent(new Event('change'));
                if (groupCheckbox.checked) {
                    audioManager.playGlobalSound('/game/sounds/ui/legenda-item-on.mp3');
                } else {
                    audioManager.playGlobalSound('/game/sounds/ui/legenda-item-off.mp3');
                }
            });

            // When group checkbox changes, update all items accordingly
            groupCheckbox.addEventListener('change', () => {
            this.groupVisibility[groupName] = groupCheckbox.checked;
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                item.visible = groupCheckbox.checked;
                itemCheckboxes[i].checked = groupCheckbox.checked;
                this.minimap?.setItemVisibility(item, item.visible);
            }
            });

            groupDiv.appendChild(list);
            container.appendChild(groupDiv);
        }
    }

    updateLegendRotation() {
        const container = document.querySelector('.world-map-legend');
        if (!container) return;

        // Find the legend item for "Watch Me Play"
        const items = container.querySelectorAll('li');
        items.forEach(li => {
            const text = li.querySelector('span');
            const icon = li.querySelector('img');
            if (!text || !icon) return;

            if (text.textContent === 'Watch Me Play') {
            // Calculate angle from center of legend icon to mouse relative to the whole page
            const rect = icon.getBoundingClientRect();
            const iconCenterX = rect.left + rect.width / 2;
            const iconCenterY = rect.top + rect.height / 2;

            // Mouse coords relative to viewport
            const mouseX = this.mouse.x + this.canvas.getBoundingClientRect().left;
            const mouseY = this.mouse.y + this.canvas.getBoundingClientRect().top;

            const angle = Math.atan2(mouseY - iconCenterY, mouseX - iconCenterX) - Math.PI / 2;
            const deg = angle * (180 / Math.PI);

            icon.style.transform = `rotate(${deg}deg)`;
            }
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.cx = this.canvas.width / 2;
        this.cy = this.canvas.height / 2;
        this.scale = this.zoomScale * this.zoom;
    }
}