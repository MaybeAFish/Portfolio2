import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import * as RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';
import { BaseMap } from './map.js';

export class GameMap extends BaseMap {
  constructor(rapierWorld) {
    super(rapierWorld);
  }

  async load(scene) {
    // === Plane ===
    const plane = new THREE.Mesh(
      new THREE.BoxGeometry(250, 1, 250), // thin box instead of flat plane
      new THREE.MeshStandardMaterial({ color: 0xcccccc })
    );
    plane.position.y = -10;
    // plane.rotation.x = -Math.PI / 2;
    plane.position.y = -10;
    plane.receiveShadow = true;
    scene.add(plane);
    this.addStaticCollider(plane, scene);
    this.objects.push(plane);

    // === Cube 1 ===
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(4, 4, 4),
      new THREE.MeshStandardMaterial({ color: 0x6699ff })
    );
    cube.position.set(7, 0, 0);
    cube.castShadow = true;
    scene.add(cube);
    this.addStaticCollider(cube, scene);
    this.objects.push(cube);

    // === Cube 2 ===
    const cube2 = new THREE.Mesh(
      new THREE.BoxGeometry(100, 1, 100),
      new THREE.MeshStandardMaterial({ color: 0x6699ff })
    );
    cube2.position.set(0, -5, 0);
    cube2.castShadow = true;
    scene.add(cube2);
    this.addStaticCollider(cube2, scene);
    this.objects.push(cube2);

    // === Lights ===
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);
  }
}
