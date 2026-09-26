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

  // Disable/enable the right content when game starts
  const container = document.getElementById('game-container');
  document.getElementById('play-game-button').style.display = 'none';
  container.style.display = 'block';

  // Setup Three.js renderer and camera
  renderer = new THREE.WebGLRenderer({ antialias: true });
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

  function resizeGame() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    // false = don't overwrite CSS width/height
    renderer.setSize(width, height, false);
  }
  const resizeObserver = new ResizeObserver(resizeGame);
  resizeObserver.observe(container);
  resizeGame();

  sceneManager = new SceneManager(rapierWorld, camera, renderer);
  await sceneManager.switchScene('tutorial');

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  sceneManager?.update(delta);
}
