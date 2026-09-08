import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

export const colorblindMatrices = {
  none: null,
  deuteranopia: [
    0.625, 0.7, 0, 0,
    0.375, 0.3, 0.3, 0,
    0, 0, 0.7, 0,
    0, 0, 0, 1
  ],
  protanopia: [
    0.567, 0.558, 0, 0,
    0.433, 0.442, 0.242, 0,
    0, 0, 0.758, 0,
    0, 0, 0, 1
  ],
  tritanopia: [
    0.95, 0.433, 0, 0,
    0, 0.567, 0.558, 0,
    0, 0, 0.442, 0,
    0, 0, 0, 1
  ],
};


export const ColorMatrixShader = {
  uniforms: {
    'tDiffuse': { value: null },
    'colorMatrix': { value: new THREE.Matrix4() },
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform mat4 colorMatrix;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      color = colorMatrix * color;
      gl_FragColor = color;
    }
  `
};
