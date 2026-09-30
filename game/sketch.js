import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import * as RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';
import { SceneManager } from './scenes/scene-manager.js';
import { AudioManager } from '/game/core/audio-manager.js';
import { loadPostProcessingModules } from './core/post-processing-loader.js';

export let camera, renderer, rapierWorld, audioManager, sceneManager;

// border when focus
window.addEventListener('focus', () => {
  window.parent.postMessage({ type: 'game-focus', focused: true }, '*');
});
window.addEventListener('blur', () => {
  window.parent.postMessage({ type: 'game-focus', focused: false }, '*');
});

export async function startGame() {
  // Play button
  const container = document.getElementById('game-container');
  document.getElementById('play-game-button').style.display = 'none';

  // Setup Three.js stuff
  await RAPIER.init({
    module: '/game/rapier/rapier_wasm3d_bg.wasm'
  });
  await loadPostProcessingModules();

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

  rapierWorld = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  sceneManager = new SceneManager(rapierWorld, camera, renderer);
  await sceneManager.switchScene('tutorial');
  container.style.display = 'block';

  animate();
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  sceneManager?.update(delta);
}
