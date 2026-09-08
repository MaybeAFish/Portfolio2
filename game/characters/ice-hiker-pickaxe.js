import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

export class Pickaxe {
  constructor(model) {
    // Mesh
    this.mesh = model.clone();
    this.mesh.scale.set(0.3, 0.3, 0.3);
    this.mesh.visible = false;
    // Fly towards
    this.target = null;
    // Flying
    this.speed = 0.4;
    this.rotationSpeed = 0.2;
    // Despawn
    this.active = false;
    this.timer = 0;
    this.despawnTime = 1;
  }

  throw(fromPosition, toPosition, scene) {
    this.mesh.position.copy(fromPosition);
    this.mesh.visible = true;
    this.target = toPosition.clone();
    this.active = true;
    this.timer = 0;
    scene.add(this.mesh);
  }

  update(delta) {
    // console.log(this.target);
    if (!this.active || !this.target) return;

    // Increment timer
    this.timer += delta;
    if (this.timer >= this.despawnTime) {
      this.mesh.visible = false;
      this.active = false;
      this.target = null;
      this.timer = 0;
      return 'arrived';
    }

    const direction = new THREE.Vector3().subVectors(this.target, this.mesh.position);
    const distance = direction.length();

    if (distance < 0.01) { // much smaller threshold
      this.mesh.position.copy(this.target); // Snap to target
      this.mesh.visible = false;
      this.active = false;
      this.target = null;
      this.timer = 0;
      return 'arrived';
    }

    direction.normalize();
    const movement = direction.multiplyScalar(this.speed);

    // Prevent overshooting
    if (movement.length() > distance) {
      this.mesh.position.copy(this.target);
    } else {
      this.mesh.position.add(movement);
    }

    this.mesh.rotation.z += this.rotationSpeed;
    return 'moving';
  }
}