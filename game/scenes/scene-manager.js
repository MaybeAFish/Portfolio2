import { StartScene } from './start-scene.js';
import { TutorialScene } from './game-scenes/tutorial-scene/tutorial-scene.js';
import { GameScene } from './game-scenes/main-game-scene/game-scene.js';

import { SettingsMenu } from '/game/settings/settings-menu.js';
import { inputManager } from '/game/core/input-manager.js';
import { EffectComposer, RenderPass, ShaderPass } from '../core/post-processing-loader.js';

export class SceneManager {
  constructor(rapierWorld, camera, renderer) {
    this.rapierWorld = rapierWorld;
    this.camera = camera;
    this.renderer = renderer;

    this.composer;
    this.colorMatrixPass;

    this.currentScene = null;
    this.scenes = {
      start: new StartScene(this.switchScene.bind(this)),
      tutorial: new TutorialScene(rapierWorld, camera),
      game: new GameScene(rapierWorld, camera),
    };

    this.settingsMenu = new SettingsMenu();

    this.isSwitching = false;
  }

  async switchScene(name) {
    this.isSwitching = true;
    if (this.currentScene) {
      await this.currentScene.exit();
    }

    // Clean stuff that everyone wants cleaned
    this.rapierWorld.colliders.map.forEach((handle, collider) => {
      this.rapierWorld.removeCollider(handle, true);
    });

    if (!this.scenes[name]) {
      console.warn(`Scene '${name}' does not exist.`);
      this.isSwitching = false;
      return;
    }

    this.currentScene = this.scenes[name];
    this.rebuildComposer();

    if (this.currentScene.enter.constructor.name === 'AsyncFunction') {
      await this.currentScene.enter();
    } else {
      this.currentScene.enter();
    }

    this.isSwitching = false;
  }

  rebuildComposer() {
    // Rebuild shaders based on the scene
    if (!EffectComposer || !RenderPass || !ShaderPass) return;

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.currentScene.scene, this.camera));

    if (this.colorMatrixPass) {
      this.composer.addPass(this.colorMatrixPass);
    }
  }


  update(delta) {
    if (this.isSwitching) return;

    this.settingsMenu.update(delta);

    if (!this.settingsMenu.isOpen) {
      this.currentScene.update(delta);
    } else {
      document.body.style.cursor = 'default';
    }

    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.currentScene.scene, this.camera);
    }

    inputManager.resetFrame();
  }
}