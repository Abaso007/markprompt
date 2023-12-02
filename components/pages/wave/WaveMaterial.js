import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

import { fragmentShader } from './shaders/fragment';
import { vertexShader } from './shaders/vertex';

const WaveMaterial = shaderMaterial(
  {
    time: 0,
    opacity: 0,
    resolution: new THREE.Vector4(),
    amplitude: { value: 0.2 },
    frequency: { value: 2 },
    transparent: true,
    depthWrite: false,
  },
  vertexShader,
  fragmentShader,
);

extend({ WaveMaterial });
