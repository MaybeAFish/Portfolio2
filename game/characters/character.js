import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/loaders/GLTFLoader.js';
import { camera } from '../sketch.js';

export class Character {
  constructor(modelUrl, scale = 1) {
    this.modelUrl = modelUrl;
    this.scale = scale;
    this.mesh = null;
    this.mixer = null;
    this.actions = {}; // { idle: AnimationAction, walk: AnimationAction, ... }

    this.playerHeading = 0;
    this.cameraHeading = 0;
    this.playerHeadingOffset = 0; 
  }

  async load(onLoaded) {
    const loader = new GLTFLoader();
    loader.load(this.modelUrl, (gltf) => {
      this.mesh = gltf.scene;
      this.mesh.scale.set(this.scale, this.scale, this.scale);
      this.mesh.position.set(0, 0, 0);

      if (gltf.animations && gltf.animations.length > 0) {
        this.mixer = new THREE.AnimationMixer(this.mesh);

        for (const clip of gltf.animations) {
          const name = clip.name.toLowerCase(); // Normalize names
          const action = this.mixer.clipAction(clip);
          this.actions[name] = action;
        }

        // automatically play the first animation
        const defaultAnim = Object.keys(this.actions)[0];
        if (defaultAnim) this.playAnimation(defaultAnim);
      }


      onLoaded(this);
      this.onloaded();
    });
  }

  onloaded() { }

  update(delta) {
    if (!this.mesh) return;

    this.updateMovement(delta);
    this.applyHeading();

    // Update animations
    if (this.mixer) {
      this.mixer.update(delta);
    }
  }

  // Override to apply movement mechanics
  updateMovement(delta) {}

  applyHeading() {
    // Me head
    const playerForward = new THREE.Vector3(0, 0, -1);
    playerForward.applyQuaternion(this.mesh.quaternion);
    this.playerHeading = Math.atan2(playerForward.z, -playerForward.x) + this.playerHeadingOffset;

    // Camera head
    const cameraForward = new THREE.Vector3(0, 0, 1);
    cameraForward.applyQuaternion(camera.quaternion);
    this.cameraHeading = Math.atan2(cameraForward.z, -cameraForward.x);
  }

  playAnimation(name, fadeDuration = 0.2) {
    if (!this.mixer || !this.actions[name]) {
      console.warn(`Animation '${name}' not found or mixer not ready.`);
      return;
    }

    if (this.currentAnimation === name) return; // already playing

    for (const key in this.actions) {
      this.actions[key].fadeOut(fadeDuration);
    }

    const action = this.actions[name];
    action.reset().fadeIn(fadeDuration).play();

    this.currentAnimation = name;
  }

}