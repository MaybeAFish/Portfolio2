// Base class
import { TutorialTriggerZone } from './tutorial-trigger-zone.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import * as RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';
import { showTutorialBox, hideTutorialBox } from './tutorial-scene.js';
// import { startArrowToTarget } from './arrow.js';

// 1. Zone that shows a GIF in tutorial box
export class GifTutorialZone extends TutorialTriggerZone {
  constructor(scene, position, size, text, gifUrl, rapierWorld) {
    super(scene, position, size, 
    () => {
      showTutorialBox(text, gifUrl);
    }, 
    () => {
      hideTutorialBox();
    }, 
    rapierWorld);
  }
}

// 2. Zone that only shows text (A BUTTON ACTUALLY OF THE MAP, CLICKABLE )
export class TextTutorialZone extends TutorialTriggerZone {
  constructor(scene, position, size, text, rapierWorld) {
    super(scene, position, size, 
    () => {
      showTutorialBox(text);
    }, 
    () => {

    },
    rapierWorld);
  }
}

// 3. Zone that spawns arrows every 0.3m from player to a target
export class ArrowTutorialZone extends TutorialTriggerZone {
  constructor(scene, position, size, targetVec3, rapierWorld) {
    super(scene, position, size, () => {
      // startArrowToTarget(targetVec3);
    }, 
    () => {

    },
    rapierWorld);
  }
}