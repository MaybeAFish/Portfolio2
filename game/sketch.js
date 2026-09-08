import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import * as RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';

import { SceneManager } from './scenes/scene-manager.js';
import { AudioManager } from '/game/core/audio-manager.js';
import { loadPostProcessingModules } from './core/post-processing-loader.js';

export let camera, renderer, rapierWorld, audioManager, sceneManager;

const clock = new THREE.Clock();

export async function startGame() {
  await RAPIER.init({});
  await loadPostProcessingModules();

  rapierWorld = new RAPIER.World({ x: 0, y: -9.81, z: 0 });

  // Setup Three.js renderer and camera
  const container = document.getElementById('game-container');
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('character-select').style.display = 'none';
  document.getElementById('game-container').style.display = 'block';
  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 20, 0);
  camera.lookAt(0, 0, 0);

  audioManager = new AudioManager(camera);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  sceneManager = new SceneManager(rapierWorld, camera, renderer);
  await sceneManager.switchScene('tutorial');

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  sceneManager?.update(delta);
}