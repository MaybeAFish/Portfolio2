import { audioManager } from '../sketch.js';
import { inputManager } from '../core/input-manager.js';
import { renderer, sceneManager } from '../sketch.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

// For colorblindness:
import { colorblindMatrices, ColorMatrixShader } from './color-blindness.js';
import { EffectComposer, RenderPass, ShaderPass } from '../core/post-processing-loader.js';

export class SettingsMenu {
  constructor() {
    this.isOpen = false;

    this.menu = document.getElementById('settings-menu');
    this.button = document.getElementById('settings-button');
    this.button.addEventListener('click', () => this.open());
    this.fullscreenButton = document.getElementById('fullscreen-button');
    this.fullscreenButton.addEventListener('click', () => this.toggleFullscreen());

    // Closing
    this.closeBtn = document.getElementById('close-settings');
    this.menu.onclick = (e) => {
      if (e.target === this.menu) this.close();
    };
    this.closeBtn.addEventListener('click', () => this.close());

    // Tab switching logic
    const tabButtons = this.menu.querySelectorAll('.tab-button');
    const tabContents = this.menu.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active state from all
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(tab => tab.classList.remove('active-tab'));

        // Activate clicked
        button.classList.add('active');
        const targetId = button.getAttribute('data-tab');
        const targetTab = this.menu.querySelector(`#${targetId}`);
        if (targetTab) targetTab.classList.add('active-tab');
      });
    });

    document.addEventListener('fullscreenchange', () => {
      setTimeout(() => this.updateFullscreenButton(), 0);
    });

    this.handleVisualTab();
    this.handleAudioTab();
    this.handleControlsTab();
    this.handleAccessibilityTab();
  }

  handleVisualTab() {
    // Show fps
    this.fpsToggle = document.getElementById('show-fps');
    this.fpsDisplay = document.getElementById('fps-display');
    this.showFPS = false;
    this.fpsToggle.addEventListener('change', (e) => {
      this.showFPS = e.target.checked;
      this.fpsDisplay.style.display = this.showFPS ? 'block' : 'none';
    });
    this.lastFrameTime = performance.now();
    this.fps = 0;
    // Shadows
    this.shadowsToggle = document.getElementById('toggle-shadows');
    this.shadowsToggle.addEventListener('change', (e) => {
      setShadowsEnabled(e.target.checked);
    });

  }
  handleAudioTab() {
    // Master volume
    this.volumeSlider = document.getElementById('volume-master');
    this.volumeSlider.value = 0.8;
    audioManager.masterGain.gain.value = parseFloat(this.volumeSlider.value);
    this.volumeSlider.addEventListener('input', (e) => {
      audioManager.masterGain.gain.value = parseFloat(e.target.value);
    });

    // Music volume
    this.musicSlider = document.getElementById('volume-music');
    this.musicSlider.value = 1.0;
    audioManager.musicGain.gain.value = 1.0;
    this.musicSlider.addEventListener('input', (e) => {
      audioManager.musicGain.gain.value = parseFloat(e.target.value);
    });

    // SFX volume
    this.sfxSlider = document.getElementById('volume-sfx');
    this.sfxSlider.value = 1.0;
    audioManager.sfxGain.gain.value = 1.0;
    this.sfxSlider.addEventListener('input', (e) => {
      audioManager.sfxGain.gain.value = parseFloat(e.target.value);
    });
  }

  handleControlsTab() {
    const sensitivitySlider = document.getElementById('camera-sensitivity');
    sensitivitySlider.value = 1.0;
    inputManager.lookSensitivity = 0.002;

    sensitivitySlider.addEventListener('input', (e) => {
      const multiplier = parseFloat(e.target.value);
      inputManager.lookSensitivity = 0.002 * multiplier;
    });

    const keys = [
      { id: 'forward-key', binding: 'forward' },
      { id: 'backward-key', binding: 'backward' },
      { id: 'left-key', binding: 'left' },
      { id: 'right-key', binding: 'right' },
      { id: 'jump-key', binding: 'jump' },
      { id: 'interact-key', binding: 'interact' },
      { id: 'map-key', binding: 'map' },
      { id: 'settings-key', binding: 'settings' },
      { id: 'fullscreen-key', binding: 'fullscreen' },
    ];

    const rebinding = { active: null };

    keys.forEach(({ id, binding }) => {
      const input = document.getElementById(id);
      const val = inputManager.bindings[binding];
      input.value = formatKeyDisplay(val);
      input.style.cursor = 'pointer';

      input.addEventListener('click', () => {
        rebinding.active = binding;
        input.value = '...';
      });
    });

    window.addEventListener('keydown', (e) => {
      if (!rebinding.active) return;
      e.preventDefault(); // prevent Enter/Tab/etc. from triggering other stuff

      const key = e.key.toLowerCase();
      inputManager.bindings[rebinding.active] = key;
      const input = document.getElementById(`${rebinding.active}-key`);
      input.value = formatKeyDisplay(key);

      rebinding.active = null;
    });
  }

  handleAccessibilityTab() {
    this.accessibilitySettings = {
      subtitles: false,
      textSize: 'normal',
      colorblindMode: 'none',
    };

    const subtitlesCheckbox = document.getElementById('subtitles');
    const textSizeSelect = document.getElementById('text-size');
    const colorblindSelect = document.getElementById('colorblind-mode');

    // Initialize from stored or default
    subtitlesCheckbox.checked = this.accessibilitySettings.subtitles;
    textSizeSelect.value = this.accessibilitySettings.textSize;
    colorblindSelect.value = this.accessibilitySettings.colorblindMode;

    subtitlesCheckbox.addEventListener('change', (e) => {
      this.accessibilitySettings.subtitles = e.target.checked;
      //
    });

    textSizeSelect.addEventListener('change', (e) => {
      this.accessibilitySettings.textSize = e.target.value;

      switch (e.target.value) {
        case 'small':
          document.documentElement.style.fontSize = '12px';
          break;
        case 'normal':
          document.documentElement.style.fontSize = '16px';
          break;
        case 'large':
          document.documentElement.style.fontSize = '20px';
          break;
        default:
          document.documentElement.style.fontSize = '16px';
      }
    });


    // Colorblindness
    colorblindSelect.addEventListener('change', (e) => {
      // Setup composer
      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(sceneManager.currentScene.scene, sceneManager.camera));

      const colorMatrixPass = new ShaderPass(ColorMatrixShader);
      composer.addPass(colorMatrixPass);

      // Save for use in SettingsMenu
      sceneManager.colorMatrixPass = colorMatrixPass;
      sceneManager.composer = composer;
      this.accessibilitySettings.colorblindMode = e.target.value;

      const matArr = colorblindMatrices[this.accessibilitySettings.colorblindMode];
      if (!matArr) {
        // Disable filter
        sceneManager.colorMatrixPass.enabled = false;
      } else {
        sceneManager.colorMatrixPass.enabled = true;
        // Convert array to THREE.Matrix4
        const m = new THREE.Matrix4();
        m.set(
          matArr[0], matArr[1], matArr[2], matArr[3],
          matArr[4], matArr[5], matArr[6], matArr[7],
          matArr[8], matArr[9], matArr[10], matArr[11],
          matArr[12], matArr[13], matArr[14], matArr[15]
        );
        sceneManager.colorMatrixPass.uniforms.colorMatrix.value = m;
      }
    });

  }


  update(delta) {
    // P(enis)
    if (inputManager.keysPressed[inputManager.bindings.settings]) {
      if (this.menu.style.display === 'flex') this.close();
      else this.open();
    }

    // FPS logic
    if (this.showFPS) {
      const now = performance.now();
      const diff = now - this.lastFrameTime;
      this.fps = 1000 / diff;
      this.lastFrameTime = now;

      this.fpsDisplay.textContent = `FPS: ${this.fps.toFixed(0)}`;
    }
  }

  async toggleFullscreen() {
    if (this.fullscreenTogglePending) return;
    this.fullscreenTogglePending = true;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      this.fullscreenButton.textContent = 'Fullscreen [F]';
    } else if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
      this.fullscreenButton.textContent = 'Exit Fullscreen [F]';
    }

    this.fullscreenTogglePending = false;
  }

  updateFullscreenButton() {
    this.fullscreenButton.textContent = document.fullscreenElement
      ? 'Exit Fullscreen [F]'
      : 'Fullscreen [F]';
  }

  open() {
    if (!this.menu) return;
    this.menu.style.display = 'flex';
    audioManager.playGlobalSound('/game/sounds/ui/settings-open.mp3');
    this.volumeSlider.value = audioManager.masterGain.gain.value;

    sceneManager.currentScene.onMenuOpen();
    
    // Blur the settings button to prevent key re-trigger
    this.button.blur();
    this.isOpen = true;
    console.log("open dont make me mad")
  }

  close() {
    if (!this.menu) return;
    this.menu.style.display = 'none';
    this.isOpen = false;
    sceneManager.currentScene.onMenuClose();
    audioManager.playGlobalSound('/game/sounds/ui/settings-close.mp3');
  }
}

function setShadowsEnabled(enabled) {
  renderer.shadowMap.enabled = enabled;
  
  // Meshes
  sceneManager.currentScene.scene.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = enabled;
      obj.receiveShadow = enabled;
    }
  });

  // Lights
  sceneManager.currentScene.scene.traverse((obj) => {
    if (
      (obj instanceof THREE.DirectionalLight ||
       obj instanceof THREE.SpotLight ||
       obj instanceof THREE.PointLight)
    ) {
      obj.castShadow = enabled;
    }
  });
  
  renderer.shadowMap.needsUpdate = true;
}

function formatKeyDisplay(key) {
  // Thanks chatgpt this works great
  const symbolMap = {
    ' ': 'Space',
    'enter': 'Enter ⏎',
    'shift': 'Shift ⇧',
    'control': 'Ctrl ⌃',
    'alt': 'Alt ⎇',
    'escape': 'Esc ⎋',
    'tab': 'Tab ↹',
    'arrowup': '↑',
    'arrowdown': '↓',
    'arrowleft': '←',
    'arrowright': '→',
  };

  key = key.toLowerCase();
  if (symbolMap[key]) return symbolMap[key];

  return key.length === 1 ? key.toUpperCase() : key[0].toUpperCase() + key.slice(1);
}
