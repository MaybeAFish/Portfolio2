import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import { InteractableFactory } from '../interactables/interactable-factory.js';
import { renderer } from '../sketch.js';

export let interactables = [];
export const InteractButton = document.getElementById('interact-button');

export class InteractableManager {
  constructor() {
    this.lastClosest = null;
  }
  
  async load(scene, player, interactablesGroup, progressCallback) {
    const factory = new InteractableFactory(scene, interactables);
    await factory.createInteractables(player, interactablesGroup, progressCallback);
  }

  dispose() {
    interactables = [];
  }

  update(delta, camera, player) {
    let closest = null;
    let closestDist = Infinity;

    for (const i of interactables) {
      if (!i.mesh) continue;
      const dist = player.mesh.position.distanceTo(i.mesh.position);
      if (dist < i.interactRange && dist < closestDist) {
        closest = i;
        closestDist = dist;
      }
    }

    if (closest !== this.lastClosest) {
      // If we were close to something and walked away, call onWalkTooFar
      if (this.lastClosest && typeof this.lastClosest.onWalkTooFar === 'function') {
        this.lastClosest.onWalkTooFar();
      }

      // Update lastClosest
      this.lastClosest = closest;
    }

    if (closest) {
      closest.showInteractButton(camera, renderer);
      closest.update(delta);
    } else {
      InteractButton.style.display = 'none';
    }
  }
}