import { OverlayInteractable } from './interactable-implementations/overlay-interactable.js';
import { TeleportInteractable } from './interactable-implementations/teleport-interactable.js';
import { ChangeSceneInteractable } from './interactable-implementations/change-scene-interactable.js';
import { DoorInteractable } from './interactable-implementations/door-interactable.js';

export class InteractableFactory {
  constructor(scene, interactables) {
    this.scene = scene;
    this.interactables = interactables;
  }

  async makeInteractable(interactable) {
    await interactable.init();
    await this.interactables.push(interactable);
    this.scene.add(interactable.mesh);
  }

  async getTemplateContent(url) {
    const res = await fetch(url);
    const html = await res.text();
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    return wrapper.firstElementChild;
  }

  async createInteractables(player, interactablesGroup, progressCallback = () => {}) {
    let total = 0;
    for (const groupArray of Object.values(interactablesGroup)) {
      total += groupArray.length;
    }

    let loaded = 0;

    for (const groupArray of Object.values(interactablesGroup)) {
      for (const data of groupArray) {
        const type = data.type || 'default';
        const InteractableClass = data.type;

        let content = null;
        if (data.templateUrl) {
          content = await this.getTemplateContent(data.templateUrl);
        }

        let interactable;

        if (type === TeleportInteractable) {
          interactable = new InteractableClass(data.position, data.name, data.options, data.targetPosition, player);
        } else if (type === ChangeSceneInteractable) {
          interactable = new InteractableClass(data.position, data.name, data.options, data.sceneName);
        } else if (type === DoorInteractable) {
          interactable = new InteractableClass(data.position, data.name, data.options);
        } else {
          interactable = new InteractableClass(data.position, data.name, data.options, content);
        }

        await this.makeInteractable(interactable);
        loaded++;
        progressCallback(loaded, total);
      }
    }
  }

}
