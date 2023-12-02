import { useFrame, useThree } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';

import './WaveMaterial';

const Wave = ({ showPoints, animate }) => {
  const { pointer } = useThree();
  const groupRef = useRef();
  const materialRef = useRef();
  const pointsMaterialRef = useRef();

  // useEffect(() => {
  //   pointsMaterialRef.current.
  // }, [])

  useFrame(
    (state) => {
      if (animate) {
        groupRef.current.rotation.x = THREE.MathUtils.lerp(
          groupRef.current.rotation.x,
          (-pointer.y * Math.PI) / 90,
          0.03,
        );
        groupRef.current.rotation.z = THREE.MathUtils.lerp(
          groupRef.current.rotation.z,
          (pointer.x * Math.PI) / 90,
          0.02,
        );
      }
      // Frame 198 seems to have less artifacts than others.
      const t = animate ? state.clock.elapsedTime / 16 : 198;
      materialRef.current.uniforms.time.value = t;
      pointsMaterialRef.current.uniforms.time.value = t;
      materialRef.current.uniforms.opacity.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.opacity.value,
        showPoints ? 0 : 1,
        showPoints ? 0.02 : 0.005,
      );
      pointsMaterialRef.current.uniforms.opacity.value = THREE.MathUtils.lerp(
        pointsMaterialRef.current.uniforms.opacity.value,
        showPoints ? 1 : 0,
        showPoints ? 0.02 : 0.2,
      );
    },
    [showPoints, animate],
  );

  return (
    <group ref={groupRef}>
      <mesh>
        <planeGeometry args={[60, 10, 300, 300]} />
        <waveMaterial ref={materialRef} wireframe={false} />
      </mesh>
      <points>
        <planeGeometry args={[60, 10, 300, 300]} />
        <waveMaterial ref={pointsMaterialRef} />
      </points>
    </group>
  );
};

export default Wave;
