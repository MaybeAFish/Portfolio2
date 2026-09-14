import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import { BaseMap } from './map.js';

export class TutorialMap extends BaseMap {
  constructor(rapierWorld) {
    super(rapierWorld);

    this.rockMaterial = new THREE.MeshStandardMaterial({
      color: 0x514b48,
      roughness: 1
    });

    this.groundRockMaterial = new THREE.MeshStandardMaterial({
      color: 0x68605b,
      roughness: 1
    });

    this.flowerBedMaterial = new THREE.MeshStandardMaterial({
      color: 0xb7a95c,
      roughness: 1
    });

    this.flowerMaterial = new THREE.MeshStandardMaterial({
      color: 0xffdd45,
      roughness: 0.9
    });

    this.stemMaterial = new THREE.MeshStandardMaterial({
      color: 0x4f8a43,
      roughness: 1
    });
  }

  async load(scene) {
    const groundY = 0;


    // ROCKY FLOOR
    const groundRocks = [
      [
        [-15, -0.45, -15],
        [31, 0.55, 31],
        [-0.02, 0.15, 0.02]
      ],
      [
        [15, -0.45, -15],
        [31, 0.55, 31],
        [0.01, -0.20, -0.02]
      ],
      [
        [-15, -0.45, 15],
        [31, 0.55, 31],
        [-0.01, 0.30, 0.01]
      ],
      [
        [15, -0.45, 15],
        [31, 0.55, 31],
        [0.02, -0.10, -0.02]
      ]
    ];
    for (const [position, scale, rotation] of groundRocks) {
      this.createRock(
        scene,
        new THREE.Vector3(...position),
        new THREE.Vector3(...scale),
        new THREE.Euler(...rotation),
        this.groundRockMaterial
      );
    }


    // FLOWERS
    const flowerPositions = [
      // Outer
      [-4.0,  0.0], [-3.7,  1.7], [-2.8,  3.0], [-1.3,  3.7],
      [ 0.3,  3.8], [ 1.8,  3.2], [ 3.0,  2.2], [ 3.7,  0.7],
      [ 3.6, -0.9], [ 2.8, -2.3], [ 1.5, -3.3], [ 0.0, -3.7],
      [-1.6, -3.4], [-2.9, -2.5], [-3.7, -1.3],
      // Middle
      [-2.8,  0.4], [-2.4,  1.8], [-1.3,  2.5], [ 0.0,  2.7],
      [ 1.4,  2.3], [ 2.4,  1.3], [ 2.7,  0.0],
      [ 2.3, -1.3], [ 1.3, -2.3], [ 0.0, -2.6],
      [-1.3, -2.3], [-2.4, -1.4],
      // landing spot
      [-1.7,  0.2], [-1.0,  1.1], [-0.1,  1.4], [ 0.9,  1.0],
      [ 1.5,  0.2], [ 1.0, -0.8], [ 0.1, -1.3],
      [-0.9, -1.0], [-1.5, -0.4],
      // Center
      [-0.5,  0.2], [0.4, 0.1]
    ];

    for (const [x, z] of flowerPositions) {
      const height = 0.85 + Math.random() * 0.3;
      const scale = 0.93 + Math.random() * 0.12;

      this.createFlower(
        scene,
        new THREE.Vector3(x, groundY, z + 2),
        scale,
        height
      );
    }

    // =========================================================
    // MOUNTAIN ENTRANCE
    // =========================================================
    const rockPositions = [
      [ 22, -38],
      [ 36, -28],
      [ 42, -15],
      [ 40,  -2],

      [ 40,  18],
      [ 30,  30],
      [ 15,  37],
      [  2,  35],
      [-11,  34],
      [-26,  28],
      [-34,  16],
      [-35,   0],
      [-37, -14],
      [-31, -27],
      [-21, -37],
    ];

const rockScales = [
  [12, 6, 14],
  [11, 8, 12],
  [14, 7, 11],
  [12, 9, 14],
  [15, 7, 12],
  [11, 9, 15],
  [14, 8, 12],
  [12, 6, 14],
  [15, 8, 11],
  [12, 9, 14],
  [14, 7, 12],
  [11, 9, 15],
  [15, 6, 12],
  [12, 8, 14],
  [14, 7, 11],
];

    for (let i = 0; i < rockPositions.length; i++) {
      const [x, z] = rockPositions[i];
      const [sx, sy, sz] = rockScales[i];

      this.createRock(
        scene,
        new THREE.Vector3(x, sy * 0.5, z),
        new THREE.Vector3(sx, sy, sz),
        new THREE.Euler(
          (Math.random() - 0.5) * 0.15,
          Math.random() * Math.PI * 2,
          (Math.random() - 0.5) * 0.15
        )
      );
    }

    // =========================================================
    // LIGHTING
    // =========================================================

    const ambientLight = new THREE.AmbientLight(
      0xffffff,
      0.42
    );

    scene.add(ambientLight);

    const sunlight = new THREE.DirectionalLight(
      0xffffff,
      1.35
    );

    sunlight.position.set(
      10,
      40,
      15
    );

    sunlight.castShadow = true;

    sunlight.shadow.mapSize.width = 2048;
    sunlight.shadow.mapSize.height = 2048;

    sunlight.shadow.camera.near = 0.5;
    sunlight.shadow.camera.far = 180;

    sunlight.shadow.camera.left = -80;
    sunlight.shadow.camera.right = 80;
    sunlight.shadow.camera.top = 80;
    sunlight.shadow.camera.bottom = -80;

    scene.add(sunlight);


    // Warm light around the flowerbed.
    const flowerLight = new THREE.PointLight(
      0xffdf9a,
      1.0,
      30
    );

    flowerLight.position.set(
      0,
      4,
      2
    );

    scene.add(flowerLight);
  }


  // ===========================================================
  // CREATE ROCK
  // ===========================================================

  createRock(
    scene,
    position,
    scale,
    rotation = new THREE.Euler(),
    material = this.rockMaterial
  ) {
    const geometry = new THREE.DodecahedronGeometry(
      1,
      0
    );

    const rock = new THREE.Mesh(
      geometry,
      material
    );

    rock.position.copy(position);
    rock.scale.copy(scale);
    rock.rotation.copy(rotation);

    rock.castShadow = true;
    rock.receiveShadow = true;

    scene.add(rock);

    // Make sure the transformed geometry is ready
    // before creating the Rapier collider.
    rock.updateMatrixWorld(true);

    const collider = this.addStaticCollider(rock);

    this.objects.push({
      mesh: rock,
      collider
    });

    return rock;
  }


  // ===========================================================
  // FLOWER
  // ===========================================================

  createFlower(scene, position, scale = 1, height = 1) {

    // Stem
    const stemGeometry = new THREE.CylinderGeometry(
      0.08,
      0.11,
      1.1,
      5
    );

    const stem = new THREE.Mesh(
      stemGeometry,
      this.stemMaterial
    );

    stem.scale.set(scale, height, scale);

    stem.position.set(
      position.x,
      position.y + 0.55 * height,
      position.z
    );

    scene.add(stem);

    this.objects.push({
      mesh: stem,
      collider: null
    });


    // Center
    const centerGeometry = new THREE.SphereGeometry(
      0.18,
      6,
      4
    );

    const center = new THREE.Mesh(
      centerGeometry,
      new THREE.MeshStandardMaterial({
        color: 0xffa900,
        roughness: 1
      })
    );

    center.scale.setScalar(scale);

    center.position.set(
      position.x,
      position.y + 1.15 * height,
      position.z
    );

    scene.add(center);

    this.objects.push({
      mesh: center,
      collider: null
    });


    // Petals
    const petalGeometry = new THREE.SphereGeometry(
      0.24,
      6,
      4
    );

    const petalOffsets = [
      [ 0.00,  0.00, -0.32],
      [ 0.00,  0.00,  0.32],
      [-0.32,  0.00,  0.00],
      [ 0.32,  0.00,  0.00],
      [ 0.23,  0.00,  0.23],
      [-0.23,  0.00,  0.23],
      [ 0.23,  0.00, -0.23],
      [-0.23,  0.00, -0.23],
    ];

    for (const [ox, oy, oz] of petalOffsets) {
      const petal = new THREE.Mesh(
        petalGeometry,
        this.flowerMaterial
      );

      petal.scale.set(
        scale,
        scale * 0.55,
        scale
      );

      petal.position.set(
        position.x + ox * scale,
        position.y + 1.15 * height + oy * scale,
        position.z + oz * scale
      );

      scene.add(petal);

      this.objects.push({
        mesh: petal,
        collider: null
      });
    }
  }
}