import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import * as RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';

export class BaseMap {
  constructor(rapierWorld) {
    this.rapierWorld = rapierWorld;
    this.objects = []; // { mesh, collider }
  }

  addBox(
    scene,
    size,
    position,
    color = 0x555555,
    castShadow = false,
    receiveShadow = true
  ) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(size.x, size.y, size.z),
      new THREE.MeshStandardMaterial({ color })
    );

    mesh.position.copy(position);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;

    scene.add(mesh);

    const collider = this.addStaticCollider(mesh);

    this.objects.push({
      mesh,
      collider
    });

    return mesh;
  }

  /**
   * Creates a hidden static box collider.
   * Useful when the visual environment is intentionally uneven.
   */
  addBoxCollider(size, position) {
    const desc = RAPIER.ColliderDesc.cuboid(
      size.x / 2,
      size.y / 2,
      size.z / 2
    );

    desc.setTranslation(
      position.x,
      position.y,
      position.z
    );

    const collider = this.rapierWorld.createCollider(desc);

    this.objects.push({
      mesh: null,
      collider
    });

    return collider;
  }

  /**
   * Creates a Rapier trimesh collider that exactly follows
   * the mesh's current position, rotation and scale.
   */
  addStaticCollider(mesh) {
    mesh.updateMatrixWorld(true);

    const geometry = mesh.geometry;

    if (!geometry.index) {
      geometry.setIndex(
        [...Array(geometry.attributes.position.count).keys()]
      );
    }

    const positionAttribute = geometry.attributes.position;
    const indexAttribute = geometry.index;

    const worldVertices = [];

    for (let i = 0; i < positionAttribute.count; i++) {
      const vertex = new THREE.Vector3(
        positionAttribute.getX(i),
        positionAttribute.getY(i),
        positionAttribute.getZ(i)
      );

      vertex.applyMatrix4(mesh.matrixWorld);

      worldVertices.push(
        vertex.x,
        vertex.y,
        vertex.z
      );
    }

    const indices = Array.from(indexAttribute.array);

    const desc = RAPIER.ColliderDesc.trimesh(
      worldVertices,
      indices
    );

    return this.rapierWorld.createCollider(desc);
  }

  /**
   * Registers a mesh and optionally gives it a static collider.
   */
  addMesh(scene, mesh, createCollider = true) {
    scene.add(mesh);

    let collider = null;

    if (createCollider) {
      collider = this.addStaticCollider(mesh);
    }

    this.objects.push({
      mesh,
      collider
    });

    return mesh;
  }

  async dispose(scene) {
    for (const obj of this.objects) {
      if (obj.mesh) {
        if (obj.mesh.parent) {
          obj.mesh.parent.remove(obj.mesh);
        }

        obj.mesh.geometry?.dispose();

        if (Array.isArray(obj.mesh.material)) {
          obj.mesh.material.forEach(
            material => material?.dispose?.()
          );
        } else {
          obj.mesh.material?.dispose?.();
        }
      }

      if (obj.collider) {
        this.rapierWorld.removeCollider(
          obj.collider,
          true
        );
      }
    }

    this.objects = [];
  }

  async load(scene) {}
}