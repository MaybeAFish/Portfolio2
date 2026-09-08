import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import * as RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';
import { sceneManager } from '../sketch.js';

export class BaseMap {
  constructor(rapierWorld) {
    this.rapierWorld = rapierWorld;
    this.objects = []; // { mesh, collider }
  }

  addBox(scene, size, position, color = 0x555555, castShadow = false, receiveShadow = true) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(size.x, size.y, size.z),
      new THREE.MeshStandardMaterial({ color })
    );
    mesh.position.copy(position);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;
    scene.add(mesh);

    const collider = this.addStaticCollider(mesh);
    this.objects.push({ mesh, collider });

    return mesh;
  }

  addStaticCollider(mesh) {
    const geometry = mesh.geometry;
    if (!geometry.index) {
      geometry.setIndex([...Array(geometry.attributes.position.count).keys()]);
    }

    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    const posAttr = geometry.attributes.position;
    const vertices = [];
    for (let i = 0; i < posAttr.count; i++) {
      vertices.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
    }

    const indexAttr = geometry.index;
    const indices = Array.from(indexAttr.array);

    const worldPos = new THREE.Vector3();
    mesh.getWorldPosition(worldPos);

    const desc = RAPIER.ColliderDesc
      .trimesh(vertices, indices)
      .setTranslation(worldPos.x, worldPos.y, worldPos.z);

    return this.rapierWorld.createCollider(desc);
  }

  async dispose(scene) {
    for (const obj of this.objects) {
      if (obj.mesh) {
        if (obj.mesh.parent) obj.mesh.parent.remove(obj.mesh);
        obj.mesh.geometry?.dispose();
        if (Array.isArray(obj.mesh.material)) {
          obj.mesh.material.forEach(m => m?.dispose?.());
        } else {
          obj.mesh.material?.dispose?.();
        }
      }
      if (obj.collider) {
        this.rapierWorld.removeCollider(obj.collider, true);
      }
    }
    this.objects = [];
  }

  // To be overridden
  async load(scene) {}
}