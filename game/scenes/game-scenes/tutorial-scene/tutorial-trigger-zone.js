import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import * as RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';

export class TutorialTriggerZone {
  constructor(scene, position, size, onEnter, onExit, rapierWorld, debug = true) {
    this.position = position;
    this.size = size;
    this.onEnter = onEnter;
    this.onExit = onExit;
    this.isInside = false;  // Track current state
    this.rapierWorld = rapierWorld;

    // Debug mesh as before
    if (debug) {
      const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
      const material = new THREE.MeshBasicMaterial({ color: 0x888888, wireframe: true });
      this.debugMesh = new THREE.Mesh(geometry, material);
      this.debugMesh.position.copy(position);
      scene.add(this.debugMesh);
    }

    // Create RAPIER sensor collider as before
    const colliderDesc = RAPIER.ColliderDesc.cuboid(size.x / 2, size.y / 2, size.z / 2)
      .setTranslation(position.x, position.y, position.z)
      .setSensor(true);

    this.collider = rapierWorld.createCollider(colliderDesc);
  }

  check(player) {
    const feet = player.mesh.position;
    const headY = feet.y + player.charHeight;

    const inX = Math.abs(feet.x - this.position.x) < this.size.x / 2;
    const inZ = Math.abs(feet.z - this.position.z) < this.size.z / 2;

    const inYFeet = Math.abs(feet.y - this.position.y) < this.size.y / 2;
    const inYHead = Math.abs(headY - this.position.y) < this.size.y / 2;

    const currentlyInside = inX && inZ && (inYFeet || inYHead);

    if (currentlyInside && !this.isInside) {
      this.isInside = true;
      this.onEnter();
    } else if (!currentlyInside && this.isInside) {
      this.isInside = false;
      if (this.onExit) this.onExit();
    }
  }
}