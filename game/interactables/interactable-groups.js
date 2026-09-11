import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

import { OverlayInteractable } from './interactable-implementations/overlay-interactable.js';
import { TeleportInteractable } from './interactable-implementations/teleport-interactable.js';
import { ChangeSceneInteractable } from './interactable-implementations/change-scene-interactable.js';
import { DoorInteractable } from './interactable-implementations/door-interactable.js';

const interactableHeight = 3;
export const GameInteractables = {
  "School Projects": [
    {
      type: OverlayInteractable,
      position: new THREE.Vector3(0, interactableHeight, -4),
      templateUrl: '/game/projects/cosmos-intruders.html',
      options: { color: 'rgb(231, 76, 60)', icon: '/game/map/about.png' },
      name: 'Cosmos Intruders'
    },
    {
      type: OverlayInteractable,
      position: new THREE.Vector3(30, interactableHeight, 17),
      templateUrl: '/game/projects/samurai-brush.html',
      options: { color: 'rgb(243, 156, 18)', icon: '/game/map/album.png' },
      name: 'Samurai Brush'
    },
    {
      type: OverlayInteractable,
      position: new THREE.Vector3(27, interactableHeight, -12),
      templateUrl: '/game/projects/arcane-fending.html',
      options: { color: 'rgb(241, 196, 15)', icon: '/game/map/fav-games.png' },
      name: 'Arcane Fending'
    },
    {
      type: OverlayInteractable,
      position: new THREE.Vector3(40, interactableHeight, -8.7),
      templateUrl: '/game/projects/copper-mayhem.html',
      options: { color: 'rgb(247, 243, 38)', icon: '/game/map/watch.png' },
      name: 'Copper Mayhem'
    },
    {
      type: OverlayInteractable,
      position: new THREE.Vector3(100, interactableHeight, 15),
      templateUrl: '/game/projects/motion-virtual-physiotherapy.html',
      options: { color: 'rgb(32, 202, 211)', icon: '/game/map/recipes.png' },
      name: 'Motion'
    },
  ],
  "Personal projects": [
    {
      type: OverlayInteractable,
      position: new THREE.Vector3(-33, interactableHeight, 15),
      templateUrl: '/game/projects/monogame-game-editor.html',
      options: { color: 'rgb(241, 122, 204)', icon: '/game/map/pixelart.gif' },
      name: 'Monogame Game Editor'
    },
  ],
  "Personal projects/gamejams": [
    {
      type: OverlayInteractable,
      position: new THREE.Vector3(-110, interactableHeight, 45),
      templateUrl: '/game/projects/dont-pop-the-balloon.html',
      options: { color: 'rgb(129, 255, 196)', icon: '/game/map/say-something.png' },
      name: 'DONT pop the balloon'
    },
    {
      type: OverlayInteractable,
      position: new THREE.Vector3(0, interactableHeight, 15),
      templateUrl: '/game/projects/monogame-game-editor.html',
      options: { color: 'rgb(255, 255, 255)', icon: '/game/map/contact.png' },
      name: 'It aint all about you!'
    }
  ],
  "Teleports": [
    {
      type: TeleportInteractable,
      name: 'To Sky Island',
      position: new THREE.Vector3(10, 3, 10),
      targetPosition: new THREE.Vector3(100, 50, -20),
      options: { color: 'cyan', icon: '/game/map/teleport.png', }
    },
    {
      type: ChangeSceneInteractable,
      name: 'Go To Tutorial Cave',
      position: new THREE.Vector3(20, -3, 6),
      sceneName: 'tutorial',
      options: { color: 'cyan', icon: '/game/map/teleport.png', }
    },
  ]
};

export const TutorialInteractables = {
  "Get close to this": [
    {
      type: OverlayInteractable,
      position: new THREE.Vector3(0, -3, -4),
      templateUrl: '/game/projects/motion-virtual-physiotherapy.html',
      options: { color: 'rgb(231, 76, 60)', icon: '/game/map/about.png' },
      name: 'Motion',
      worldMapName: 'and then press [E].'
    },
  ],
  "Teleports": [
    {
      type: TeleportInteractable,
      name: 'Pass through the wall',
      position: new THREE.Vector3(30, -3, 60),
      targetPosition: new THREE.Vector3(100, 50, -20),
      options: { color: 'cyan', icon: '/game/map/teleport.png', }
    },
    {
      type: ChangeSceneInteractable,
      name: 'Leave Tutorial Cave',
      position: new THREE.Vector3(10, -3, 6),
      sceneName: 'game',
      options: { color: 'cyan', icon: '/game/map/teleport.png', }
    },
  ],
  "Doors": [
    {
      type: DoorInteractable,
      name: 'Big Beefy Door',
      position: new THREE.Vector3(10, -3, 100),
      targetPosition: new THREE.Vector3(100, 50, -30),
      options: { color: 'cyan', icon: '/game/map/teleport.png', }
    },
  ],
};