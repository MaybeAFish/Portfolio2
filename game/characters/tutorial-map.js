import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import * as RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';
import { sceneManager } from '../sketch.js';
import { BaseMap } from './map.js';

export class TutorialMap extends BaseMap {
  constructor(rapierWorld) {
    super(rapierWorld);
  }

  async load(scene) {
    // === Ground plane ===
    this.addBox(scene, new THREE.Vector3(250, 1, 250), new THREE.Vector3(0, -10, 0), 0x444444);

    // === Cave Walls & Rocks ===
    // Large cave walls, set up in a rough circle
    const wallThickness = 10;
    const caveRadius = 60;

    // Circle of wall boxes around origin, leaving entrance gaps
    for (let angle = 0; angle < 360; angle += 30) {
      if (angle >= 90 && angle <= 150) continue; // entrance gap
      const rad = THREE.MathUtils.degToRad(angle);
      const x = Math.cos(rad) * caveRadius;
      const z = Math.sin(rad) * caveRadius;
      this.addBox(scene, new THREE.Vector3(wallThickness, 15, 20), new THREE.Vector3(x, 2, z), 0x333333);
    }

    // === Rock piles in cave (random-ish)
    const rockPositions = [
      new THREE.Vector3(10, -8, 5),
      new THREE.Vector3(-20, -8, 10),
      new THREE.Vector3(-30, -7, -10),
      new THREE.Vector3(25, -8, -15),
      new THREE.Vector3(15, -8, -25),
    ];
    rockPositions.forEach(pos => {
      this.addBox(scene, new THREE.Vector3(10, 6, 6), pos, 0x666666);
    });

    // === Tutorial Zones (larger now) ===
    // (You said player is fast and zones small, so increased sizes)
    const zoneSize = new THREE.Vector3(10, 6, 10);

    // === Jump area ===
    // Player must jump to enter here, block otherwise
    this.jumpZoneArea = this.addBox(scene, zoneSize, new THREE.Vector3(30, 1, 0), 0x226622);
    // TODO: Implement player jump gating logic here

    // === Double Jump area ===
    // Player must double jump to enter here, block otherwise
    this.doubleJumpZoneArea = this.addBox(scene, zoneSize, new THREE.Vector3(45, 1, 0), 0x442266);
    // TODO: Implement player double jump gating logic here

    // === Light setup ===
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 25, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);
  }
}
