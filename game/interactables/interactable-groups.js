import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

import { OverlayInteractable } from './interactable-implementations/overlay-interactable.js';
import { TeleportInteractable } from './interactable-implementations/teleport-interactable.js';
import { ChangeSceneInteractable } from './interactable-implementations/change-scene-interactable.js';
import { DoorInteractable } from './interactable-implementations/door-interactable.js';

const interactableHeight = 3;
export const GameInteractables = {
  "Get to know me": [
    {
      type: OverlayInteractable,
      position: new THREE.Vector3(0, interactableHeight, -4),
      templateUrl: '/about/intro/intro.html',
      options: { color: 'rgb(231, 76, 60)', icon: '/game/map/about.png' },
      name: 'About Me'
    },
    {
      type: OverlayInteractable,
      position: new THREE.Vector3(30, interactableHeight, 17),
      templateUrl: '/about/testimonials/testimonials.html',
      options: { color: 'rgb(243, 156, 18)', icon: '/game/map/album.png' },
      name: 'Album'
    },
    {
      type: OverlayInteractable,
      position: new THREE.Vector3(27, interactableHeight, -12),
      templateUrl: '/about/fav_games/fav_games.html',
      options: { color: 'rgb(241, 196, 15)', icon: '/game/map/fav-games.png' },
      name: 'Favourite Games'
    },
    {
      type: OverlayInteractable,
      position: new THREE.Vector3(40, interactableHeight, -8.7),
      templateUrl: '/about/likes/likes.html',
      options: { color: 'rgb(247, 243, 38)', icon: '/game/map/watch.png' },
      name: 'Watch Me Play'
    },
    {
      type: OverlayInteractable,
      position: new THREE.Vector3(-17, interactableHeight, -24),
      templateUrl: '/about/likes/likes.html',
      options: { color: 'rgb(24, 243, 184)', icon: '/game/map/music.png' },
      name: 'Music'
    },
    {
      type: OverlayInteractable,
      position: new THREE.Vector3(100, interactableHeight, 15),
      templateUrl: '/about/likes/likes.html',
      options: { color: 'rgb(32, 202, 211)', icon: '/game/map/recipes.png' },
      name: 'Recipes'
    },
    {
      type: OverlayInteractable,
      position: new THREE.Vector3(23, interactableHeight, 42),
      templateUrl: '/about/likes/likes.html',
      options: { color: 'rgb(24, 110, 167)', icon: '/game/map/bucket.png' },
      name: 'Bucketlist'
    },
    {
      type: OverlayInteractable,
      position: new THREE.Vector3(0, interactableHeight, -40),
      templateUrl: '/about/likes/likes.html',
      options: { color: 'rgb(150, 28, 198)', icon: '/game/map/happy.png' },
      name: 'What I Like'
    },
    {
      type: OverlayInteractable,
      position: new THREE.Vector3(0, interactableHeight, 40),
      templateUrl: '/about/likes/likes.html',
      options: { color: 'rgb(199, 100, 241)', icon: '/game/map/annoy.png' },
      name: 'What Annoys Me'
    }
  ],
  "My art": [
    {
      type: OverlayInteractable,
      position: new THREE.Vector3(-24, interactableHeight, 25),
      templateUrl: '/about/riddles/riddles.html',
      options: { color: 'rgb(175, 101, 244)', icon: '/game/map/riddles.gif' },
      name: 'Riddles'
    },
    {
      type: OverlayInteractable,
      position: new THREE.Vector3(-33, interactableHeight, 15),
      templateUrl: '/about/art/art.html',
      options: { color: 'rgb(241, 122, 204)', icon: '/game/map/pixelart.gif' },
      name: 'Pixelart'
    },
    {
      type: OverlayInteractable,
      position: new THREE.Vector3(-45, interactableHeight, 30),
      templateUrl: '/about/art/art.html',
      options: { color: 'rgb(243, 236, 120)', icon: '/game/map/models.gif' },
      name: 'Models'
    },
    {
      type: OverlayInteractable,
      position: new THREE.Vector3(-49, interactableHeight, 35),
      templateUrl: '/about/art/art.html',
      options: { color: 'rgb(248, 185, 126)', icon: '/game/map/textures.gif' },
      name: 'Textures'
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
  ],
  "Other": [
    {
      type: OverlayInteractable,
      position: new THREE.Vector3(-110, interactableHeight, 45),
      templateUrl: '/about/intro/intro.html',
      options: { color: 'rgb(129, 255, 196)', icon: '/game/map/say-something.png' },
      name: 'Say Something'
    },
    {
      type: OverlayInteractable,
      position: new THREE.Vector3(-130, interactableHeight, 50),
      templateUrl: '/about/testimonials/testimonials.html',
      options: { color: 'rgb(107, 245, 255)', icon: '/game/map/vote.png' },
      name: 'Vote'
    },
    {
      type: OverlayInteractable,
      position: new THREE.Vector3(0, interactableHeight, 15),
      templateUrl: '/about/intro/intro.html',
      options: { color: 'rgb(255, 255, 255)', icon: '/game/map/contact.png' },
      name: 'Contact'
    }
  ]
};

export const TutorialInteractables = {
  "Get close to me,": [
    {
      type: OverlayInteractable,
      position: new THREE.Vector3(0, -3, -4),
      templateUrl: '/about/intro/intro.html',
      options: { color: 'rgb(231, 76, 60)', icon: '/game/map/about.png' },
      name: 'Press',
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