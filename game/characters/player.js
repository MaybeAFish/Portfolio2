import * as RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';
import { Character } from '/game/characters/character.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import { camera, audioManager } from '../sketch.js';
import { inputManager } from '../core/input-manager.js';

export class Player extends Character {
  constructor(rapierWorld, scene) {
    super('/about/art/models/ice-hiker.glb', 0.7);
    this.world = rapierWorld;
    this.scene = scene;

    this.viewPitch = 0;
    this.viewYaw = 0;
    this.offset = new THREE.Vector3(0, 10, -15); // third-person offset camera

    this.velocity = new THREE.Vector3(); // total velocity
    this.speed = 220; // Units per second
    this.drag = 10; // how quickly velocity slows
    this.isGrounded = false;

    this.gravity = -80;
    this.jumpStrength = 23;
    this.maxJumps = 1;
    this.jumpsLeft = this.maxJumps;
    this.lastGroundedTime = 0;

    // Audio
    this.stepCooldown = 0;
    this.prevGrounded = true;
    this.landCooldown = 0;

    // Hitbox stuff (RAPIER)
    this.charRadius = 0.7;
    this.charHeight = 3.5;
    this.colliderDesc = RAPIER.ColliderDesc.capsule(
      this.charHeight * 0.5 - this.charRadius,
      this.charRadius
    );
    this.characterCollider = this.world.createCollider(this.colliderDesc);

    this.characterCollider.setTranslation({ x: 0, y: 5, z: 0 }, true);
    this.controller = this.world.createCharacterController(0.01);
    this.debugCapsule = this.createCapsuleDebugMesh(
      this.charHeight - 2 * this.charRadius,
      this.charRadius
    );
    this.scene.add(this.debugCapsule);

    this.meshOffset = new THREE.Vector3();
  }

  onloaded() {
    this.viewYaw = Math.PI;
    this.mesh.rotation.y = Math.PI;

    const box = new THREE.Box3().setFromObject(this.mesh);
    const height = box.max.y - box.min.y;
    this.meshOffset = new THREE.Vector3(0, -1.9, 0);
  }

  updateMovement(delta) {
    this.handleLookAround();
    this.input(delta);
    this.applyFriction(delta);
    this.handleGravity(delta);
    this.handleJump();
    this.applyVelocityAndCollisions(delta);
    this.offsetCamera();


    // Mesh animations
    if (!this.isGrounded) {
      this.playAnimation(this.velocity.y > 0 ? 'jumping' : 'falling', 0.15);
    } else if (this.velocity.length() > 1) {
      this.playAnimation('walk');
    } else {
      this.playAnimation('idle', 0.1);
    }

    // Audio
    if (this.isGrounded && !this.prevGrounded && this.landCooldown <= 0) {
      if (this.velocity.y > -27)  { this.playRandom('land-low', 1, 0.15); }
      else if (this.velocity.y > -40) { this.playRandom('land', 3, 0.25); }
      else { this.playRandom('land-high', 3, 0.4); }

      this.landCooldown = 0.5;
    }
    this.landCooldown -= delta;
    this.prevGrounded = this.isGrounded;

    // Debug
    const pos = this.characterCollider.translation();
    this.debugCapsule.position.set(pos.x, pos.y - (this.charHeight - 2 * this.charRadius) / 2, pos.z);
  }

  input(delta) {
    const inputDir = new THREE.Vector3();
    if (inputManager.keysHeld[inputManager.bindings.forward]) inputDir.z += 1;
    if (inputManager.keysHeld[inputManager.bindings.backward]) inputDir.z -= 1;
    if (inputManager.keysHeld[inputManager.bindings.left]) inputDir.x += 1;
    if (inputManager.keysHeld[inputManager.bindings.right]) inputDir.x -= 1;

    if (inputDir.lengthSq() === 0) return;

    inputDir.normalize();
    inputDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.viewYaw);
    inputDir.multiplyScalar(this.speed * delta);

    this.velocity.add(inputDir);

    // Face movement direction
    const moveDir = inputDir.clone().normalize();
    const angle = Math.atan2(moveDir.x, moveDir.z);
    this.mesh.rotation.y = this.lerpAngle(this.mesh.rotation.y, angle, 0.2);

    // Audio
    if (this.isGrounded && this.velocity.length() > 1 && this.stepCooldown <= 0) {
      this.playRandom('step', 6);
      this.stepCooldown = 0.4; // in seconds between steps
    }
    this.stepCooldown -= delta;
  }

  applyFriction(delta) {
    const damping = 1 - Math.min(this.drag * delta, 1);
    this.velocity.x *= damping;
    this.velocity.z *= damping;
  }









  applyVelocityAndCollisions(delta) {
    const desired = new RAPIER.Vector3(
      this.velocity.x * delta,
      this.velocity.y * delta,
      this.velocity.z * delta
    );

    this.controller.computeColliderMovement(this.characterCollider, desired, RAPIER.QueryFilterFlags['EXCLUDE_SENSORS']);
    const corrected = this.controller.computedMovement();
    this.isGrounded = this.controller.computedGrounded();

    // If moving up but got blocked vertically, zero Y velocity
    if (this.velocity.y > 0 && Math.abs(corrected.y) < Math.abs(this.velocity.y * delta * 0.5)) {
      this.velocity.y = 0;
    }

    const currentPos = this.characterCollider.translation();
    const newPos = {
      x: currentPos.x + corrected.x,
      y: currentPos.y + corrected.y,
      z: currentPos.z + corrected.z,
    };
    this.characterCollider.setTranslation(newPos, true);

    // const pos = this.world.getCollider(this.characterCollider).translation();
    this.mesh.position.set(
      newPos.x + this.meshOffset.x,
      newPos.y + this.meshOffset.y,
      newPos.z + this.meshOffset.z
    );


    const arrow = new THREE.ArrowHelper(
      this.velocity.clone().normalize(),
      this.mesh.position.clone(),
      this.velocity.length() * 0.1,
      0x00ff00
    );
    this.scene.add(arrow);
    setTimeout(() => {
      arrow.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      this.scene.remove(arrow);
    }, 5000);
  }

  handleLookAround() {
    if (inputManager.mouseButtons.left) {
      this.viewYaw -= inputManager.mouseDelta.x * inputManager.lookSensitivity;
      this.viewPitch = THREE.MathUtils.clamp(
        this.viewPitch + inputManager.mouseDelta.y * inputManager.lookSensitivity,
        -1.2,
        0.8
      );
      document.body.style.cursor = 'grabbing';
    } else {
      document.body.style.cursor = 'default';
    }
  }

  offsetCamera() {
    const rotatedOffset = this.offset.clone()
      .applyAxisAngle(new THREE.Vector3(1, 0, 0), this.viewPitch)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.viewYaw);

    camera.position.copy(this.mesh.position).add(rotatedOffset);
    camera.lookAt(this.mesh.position);
  }

  lerpAngle(a, b, t) {
    let diff = b - a;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    return a + diff * t;
  }

  handleGravity(delta) {
    // Smooth gravity multiplier transition
  if (this.isFallingTime === undefined) this.isFallingTime = 0;

  if (this.velocity.y < 0) {
    this.isFallingTime += delta;
  } else {
    this.isFallingTime = 0;
  }

  // Use a smoothed gravity multiplier: lerp from 0.5 to 3.0 over 0.5s
  const t = Math.min(this.isFallingTime / 2, 1); // 0 to 1 over 0.5s
  const gravityMultiplier = THREE.MathUtils.lerp(0.8, 2.0, t);

  const gravityForce = this.gravity * gravityMultiplier;
  this.velocity.y += gravityForce * delta;

  // Optional: enhance with exponential growth feel
  this.velocity.y *= 1 + (0.05 * delta);

  // Clamp terminal fall speed
  this.velocity.y = Math.max(this.velocity.y, -300);

  // Snap to 0 if grounded
  if (this.isGrounded && this.velocity.y < 0) {
    this.velocity.y = 0;
    this.isFallingTime = 0; // Reset fall timer
  }

  }

  handleJump() {
    const now = performance.now() / 1000;

    if (this.isGrounded) {
      this.lastGroundedTime = now;
      this.jumpsLeft = this.maxJumps;
    }

    const pressed = inputManager.keysPressed[inputManager.bindings.jump];
    if (pressed) {
      // Coyote time (0.15s)
      if (this.isGrounded || (now - this.lastGroundedTime) < 0.15) {
        this.velocity.y = this.jumpStrength;
        this.lastGroundedTime = -Infinity;
        audioManager.playGlobalSound('/game/sounds/player/jump.mp3', 0.5);
      } else if (this.jumpsLeft > 0) {
        this.velocity.y = this.jumpStrength;
        this.jumpsLeft--;
        audioManager.playGlobalSound('/game/sounds/player/double-jump.mp3', 0.3);
      }
    }

  }

  createCapsuleDebugMesh(height, radius) {
    const group = new THREE.Group();

    // Middle cylinder
    const cylinderHeight = height;
    const cylinderGeom = new THREE.CylinderGeometry(radius, radius, cylinderHeight, 16);
    const cylinderMat = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    const cylinder = new THREE.Mesh(cylinderGeom, cylinderMat);
    cylinder.position.y = cylinderHeight / 2;
    group.add(cylinder);

    // Top sphere
    const sphereGeom = new THREE.SphereGeometry(radius, 16, 16);
    const topSphere = new THREE.Mesh(sphereGeom, cylinderMat);
    topSphere.position.y = cylinderHeight;
    group.add(topSphere);

    // Bottom sphere
    const bottomSphere = new THREE.Mesh(sphereGeom, cylinderMat);
    bottomSphere.position.y = 0;
    group.add(bottomSphere);

    return group;
  }

  setPosition(x, y, z) {
    if (!this.characterCollider) return;

    // Set collider position
    this.characterCollider.setTranslation({ x, y, z }, true);

    // Set mesh with offset
    this.mesh.position.set(
      x + this.meshOffset.x,
      y + this.meshOffset.y,
      z + this.meshOffset.z
    );
  }

  playRandom(name, count, volume = 0.3) {
    const index = 1 + Math.floor(Math.random() * count);
    audioManager.playGlobalSound(`/game/sounds/player/${name}${count > 1 ? '-' + index : ''}.mp3`, volume);
  }

  async dispose() {
    if (this.mesh && this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }
    if (this.mesh) {
      this.mesh.traverse((child) => {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              if (mat && mat.dispose) mat.dispose();
            });
          } else if (child.material.dispose) {
            child.material.dispose();
          }
        }
      });
    }

    if (this.debugCapsule && this.debugCapsule.parent) {
      this.debugCapsule.parent.remove(this.debugCapsule);
      if (this.debugCapsule.geometry) this.debugCapsule.geometry.dispose();
      if (this.debugCapsule.material) this.debugCapsule.material.dispose();
    }

    if (this.characterCollider) {
      this.world.removeCollider(this.characterCollider, true);
      this.characterCollider = null;
    }

    this.mesh = null;
    this.debugCapsule = null;
  }


}