import { Character } from '/game/characters/character.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/loaders/GLTFLoader.js';
import { Pickaxe } from '/game/characters/ice-hiker-pickaxe.js';

export class IceHiker extends Character {
  constructor(modelUrl) {
    super(modelUrl, 1.0);
    this.state = 'idle'; // idle, throwing or dashing
    this.pickaxe = null;
    this.sceneRef = null; // assigned later
    this.dashTarget = null;
    this.speed = 0.6; // Dash speed

    document.body.style.cursor = 'crosshair';
  }

  load(onLoaded) {
    super.load((char) => {
      // Load pickaxe model
      const loader = new GLTFLoader();
      loader.load('/general/art/models/the-ice-hiker/pickaxe.glb', (gltf) => {
        if (gltf.animations.length) {
        this.mixer = new THREE.AnimationMixer(this.mesh);

        gltf.animations.forEach((clip) => {
          this.actions[clip.name] = this.mixer.clipAction(clip);
        });

        // Play idle if available
        if (this.actions['Idle']) {
          this.actions['Idle'].play();
        } else {
          const firstKey = Object.keys(this.actions)[0];
          if (firstKey) this.actions[firstKey].play();
        }
      }
        this.pickaxe = new Pickaxe(gltf.scene);
        onLoaded(this);
      });
    });
  }

  handleClickRaycast(event, scene, camera) {
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    const groundHit = intersects.find(i => i.object.name === 'floor');
    
    if (groundHit) {
      this.handleClick(groundHit.point, scene);
    }
  }

  handleClick(worldTarget, scene) {
    if (this.state !== 'idle') return;

    this.state = 'throwing';
    this.sceneRef = scene;

    // Look at target instantly
    this.mesh.lookAt(worldTarget);
    this.playAnimation('LeftHandThrow');

    // Throw pickaxe
    this.pickaxe.throw(this.mesh.position, worldTarget, scene);

    if (!this.pickaxe.active) return;
    this.state = 'waitingToDash';
    this.dashTarget = worldTarget.clone();
  }

  updateMovement(delta, keysHeld, keysPressed) {
    if (this.pickaxe) {
      const status = this.pickaxe.update(delta);
      if (status === 'arrived') {
        this.state = 'dashing';
        this.playAnimation('Falling');
      }
    }

    if (this.state === 'dashing' && this.dashTarget) {
      const dir = new THREE.Vector3().subVectors(this.dashTarget, this.mesh.position);
      const dist = dir.length();

      if (dist < 0.2) {
        this.playAnimation('Landing');
        this.state = 'idle';
        this.dashTarget = null;
        return;
      }

      // Normalize direction and add gravity
      dir.normalize();
      const velocity = dir.multiplyScalar(this.speed);

      // Gravity
      velocity.y -= 9.8 * delta; // gravity per second

      // Move
      this.mesh.position.add(velocity);

      // Simple collision with ground (raycast down)
      const downRay = new THREE.Raycaster(
        this.mesh.position.clone(),
        new THREE.Vector3(0, -1, 0),
        0,
        0.2 // distance to check below
      );

      const intersects = downRay.intersectObjects(this.sceneRef.children, true);
      const nearGround = intersects.length > 0;

      if (nearGround) {
        // Snap to ground if falling
        this.mesh.position.y = intersects[0].point.y;
        this.playAnimation('Landing');
        this.state = 'idle';
        this.dashTarget = null;
      }
    }

    this.preventFallThroughMap();
  }

  preventFallThroughMap() {
    if (this.mesh.position.y < -10) {
      this.mesh.position.y = 0;
      this.state = 'idle';
      this.dashTarget = null;
    }
  }
}