import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/loaders/GLTFLoader.js';
import { InteractButton } from '../interactable-manager.js';
import { inputManager } from '../../core/input-manager.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

export class Interactable {
  constructor(position, name, minimapOptions = {}) {
    this.position = position;
    this.name = name;
    this.options = {
      color: minimapOptions.color || 'red',
      icon: minimapOptions.icon || null,
    };
    this.interactRange = 8;
    this.mesh = null;
  }

  async loadModel(path) {
    return new Promise((resolve) => {
      const setupMesh = (mesh) => {
        mesh.name = this.name;
        mesh.scale.set(0.8, 0.8, 0.8);
        mesh.position.copy(this.position);
        mesh.rotation.x = -Math.PI / 2;
        mesh.userData.interactable = this;

        mesh.traverse((child) => {
          if (child.isMesh && child.material?.color)
            child.material.color.set(this.options.color);
        });

        this.mesh = mesh;
        resolve(mesh);
      };

      new GLTFLoader().load(path, (gltf) => {
        setupMesh(gltf.scene);
      }, undefined, () => {
        const fallback = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.8, 1),
          new THREE.MeshStandardMaterial({ color: this.options.color }),
        );
        setupMesh(fallback);
      });
    });
  }

  update(delta) {
    if (this.mesh) this.mesh.rotation.y += delta * 1.7;

    if (inputManager.keysPressed[inputManager.bindings.interact]) this.onInteract();
  }

  onInteract() {
    console.warn('Base Interactable interacted. Override this method.');
  }

  onWalkTooFar() {}

  showInteractButton(camera, renderer) {
    if (!this.mesh) return;
    const pos = this.mesh.position.clone().project(camera);
    const x = (pos.x + 1) / 2 * renderer.domElement.clientWidth;
    const y = (-pos.y + 1) / 2 * renderer.domElement.clientHeight;
    const height = InteractButton.offsetHeight;

    InteractButton.style.left = `${x + 30}px`;
    InteractButton.style.top = `${y - height / 2}px`;
    InteractButton.style.display = 'block';
    InteractButton.textContent = `${this.name} [E]`;
    InteractButton.style.color = new THREE.Color(this.options.color).getStyle();

    InteractButton.onclick = () => this.onInteract();
  }
}