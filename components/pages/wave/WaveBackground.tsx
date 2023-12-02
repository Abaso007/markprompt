import { Canvas } from '@react-three/fiber';
import { EffectComposer, HueSaturation } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

import usePrefersReducedMotion from '@/lib/hooks/utils/use-reduced-motion';

import Wave from './Wave';

export const WaveBackground = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <Canvas
      camera={{
        position: [0.1912020407052579, -4.037434449482079, 1.8383531942382878],
      }}
    >
      <ambientLight color="white" intensity={0.5} />
      <directionalLight color="white" position={[0.5, 0, 0.866]} />
      <Wave showPoints={true} animate={!prefersReducedMotion} />
      <EffectComposer multisampling={8}>
        <HueSaturation
          blendFunction={BlendFunction.NORMAL}
          hue={0}
          saturation={0.8}
        />
      </EffectComposer>
    </Canvas>
  );
};
