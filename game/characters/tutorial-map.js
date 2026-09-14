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


    // FLOOR PLANE
    this.addBox(
      scene,
      new THREE.Vector3(200, 1, 200),
      new THREE.Vector3(0, -0.5, 0),
      0x555555
    );

    // FLOWERS
    for (let x = -3; x <= 3; x += 1) {
      for (let z = -3; z <= 3; z += 1) {
        this.createFlower(
          scene,
          new THREE.Vector3(
            x + 0.5,
            groundY,
            z + 0.5
          ),
          1,
          1
        );
      }
    }

    // SECTION 1 MOUNTAIN ENTRANCE
    const rockPositions = [
      [ 22, -38],
      [ 36, -28],
      [ 42, -15],
      [ 40,  -2],
      [ 41,  10],
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
      [12, 10, 14],
      [11, 12, 12],
      [14, 11, 11],
      [12, 13, 14],
      [11, 8, 16],
      [15, 11, 12],
      [11, 13, 15],
      [14, 12, 12],
      [12, 10, 14],
      [15, 12, 11],
      [12, 13, 14],
      [14, 11, 12],
      [11, 13, 15],
      [15, 10, 12],
      [12, 12, 14],
      [14, 11, 11],
    ];

    for (let i = 0; i < rockPositions.length; i++) {
      const [x, z] = rockPositions[i];
      const [sx, sy, sz] = rockScales[i];

      this.createRock(
        scene,
        new THREE.Vector3(x, sy * 0.5, z),
        new THREE.Vector3(sx, sy, sz),
        new THREE.Euler(0, 0, 0)
      );
    }


    // SECTION 2 CAMERA
    const rock2Positions = [
      [-18, -55],
      [-10, -66],
      [  4, -74],
      [ 18, -76],
      [ 36, -86],
    ];

    const rock2Scales = [
      [14, 12, 16],
      [13, 11, 15],
      [15, 12, 14],
      [14, 13, 16],
      [17, 14, 18],
    ];

    for (let i = 0; i < rock2Positions.length; i++) {
      const [x, z] = rock2Positions[i];
      const [sx, sy, sz] = rock2Scales[i];

      this.createRock(
        scene,
        new THREE.Vector3(x, sy * 0.5, z),
        new THREE.Vector3(sx, sy, sz),
        new THREE.Euler(0, 0, 0)
      );
    }


    // SECTION 3 JUMP
    // JUMP OBSTACLE
    this.addBox(
      scene,
      new THREE.Vector3(6, 3, 24),
      new THREE.Vector3(58, 1.5, -53),
      0x555555
    );

    // SECTION ROCKS
    const rock3Positions = [
      [57, -80],
      [81, -70],
      [92, -53],
      [100, -31],
    ];

    const rock3Scales = [
      [14, 12, 16],
      [16, 13, 14],
      [15, 12, 17],
      [17, 14, 15],
    ];

    for (let i = 0; i < rock3Positions.length; i++) {
      const [x, z] = rock3Positions[i];
      const [sx, sy, sz] = rock3Scales[i];

      this.createRock(
        scene,
        new THREE.Vector3(x, sy * 0.5, z),
        new THREE.Vector3(sx, sy, sz),
        new THREE.Euler(0, 0, 0)
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