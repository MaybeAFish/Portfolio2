import { audioManager } from '../sketch.js';
import { inputManager } from '../core/input-manager.js';
import { sceneManager } from '../sketch.js';

export class SettingsMenu {
  constructor() {
    this.isOpen = false;

    this.menu = document.getElementById('settings-menu');
    this.button = document.getElementById('settings-button');
    this.button.addEventListener('click', () => this.open());

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

    this.handleVisualTab();
    this.handleAudioTab();
    this.handleControlsTab();
  }

  handleVisualTab() {
    // Fullscreen
    this.fullScreen = document.getElementById('full-screen');
    this.fullScreen.addEventListener('click', () => {
      this.toggleFullscreen();
    });
    // Keep UI synced with actual browser fullscreen state
    document.addEventListener('fullscreenchange', () => {
      this.updateFullscreenUI();
    });
    this.updateFullscreenUI();

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
    this.shadowsEnabled = true;
    this.shadowsToggle = document.getElementById('toggle-shadows');
    this.shadowsToggle.checked = this.shadowsEnabled;

    this.shadowsToggle.addEventListener('change', (e) => {
      this.shadowsEnabled = e.target.checked;
      this.onShadowsChanged?.(this.shadowsEnabled);
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
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen change failed:', error);
    }
  }
  updateFullscreenUI() {
    const isFullscreen = !!document.fullscreenElement;
    this.fullScreen.checked = isFullscreen;
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
  }

  close() {
    if (!this.menu) return;
    this.menu.style.display = 'none';
    this.isOpen = false;
    sceneManager.currentScene.onMenuClose();
    audioManager.playGlobalSound('/game/sounds/ui/settings-close.mp3');
  }
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
