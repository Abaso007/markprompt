import { Canvas } from '@react-three/fiber';
import { EffectComposer, HueSaturation } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useEffect, useState } from 'react';
import Balancer from 'react-wrap-balancer';

import { YCIcon } from '@/components/icons/brands/YC';
import { DotsBackground } from '@/components/layouts/Dots';
import usePrefersReducedMotion from '@/lib/hooks/utils/use-reduced-motion';

import Wave from '../../wave/Wave';

export const Hero = () => {
  const [animated, setAnimated] = useState(true);
  const [joinButtonHover, setJoinButtonHover] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const handleVisibilityChange = () => {
      setAnimated(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <>
      <div className="relative flex h-[calc(100vh-30px)] w-full items-center justify-center bg-gradient-to-br from-neutral-1000 to-neutral-1100 antialiased sm:h-screen">
        <DotsBackground />
        <div className="z-10 -mt-32 flex w-full flex-col items-center px-6 sm:-mt-24 sm:px-8">
          <h1 className="fade-in-slide-up-long home-gradient-text w-full pb-8 text-center text-[2.5rem] font-semibold leading-none tracking-[-0.6px] sm:text-6xl md:text-[80px]">
            AI for customer support
          </h1>
          <p className="fade-in-slide-up-long mb-12 max-w-screen-sm text-center text-xl text-neutral-200 sm:text-2xl">
            <Balancer>
              Automate customer support, scale without increasing headcount, and
              deliver exceptional user experiences.
            </Balancer>
          </p>
          <div className="fade-in-slide-up-long">
            <a
              className="select-none whitespace-nowrap rounded-lg border-0 bg-white px-5 py-3 font-medium text-neutral-900 outline-none ring-sky-500 ring-offset-4 ring-offset-neutral-900 transition hover:ring focus:ring"
              href="https://calendly.com/markprompt/30min"
              target="_blank"
              rel="noreferrer"
              onMouseEnter={() => {
                setJoinButtonHover(true);
              }}
              onMouseLeave={() => {
                setJoinButtonHover(false);
              }}
            >
              Book a demo
            </a>
          </div>
        </div>
        <div className="animate-fade-out-long pointer-events-none absolute inset-0 z-50 bg-neutral-1100" />
        <div className="fade-in-slide-up-long absolute inset-x-0 bottom-0 z-0 h-[65%]">
          <Canvas
            camera={{
              position: [
                0.1912020407052579, -4.037434449482079, 1.8383531942382878,
              ],
            }}
          >
            <ambientLight color="white" intensity={0.5} />
            <directionalLight color="white" position={[0.5, 0, 0.866]} />
            <Wave
              showPoints={!joinButtonHover}
              animate={animated && !prefersReducedMotion}
            />
            <EffectComposer multisampling={8}>
              <HueSaturation
                blendFunction={BlendFunction.NORMAL}
                hue={0}
                saturation={0.8}
              />
            </EffectComposer>
          </Canvas>
        </div>
        <div
          className="fade-in-slide-up-long pointer-events-none absolute inset-x-0 bottom-0 flex h-[240px] flex-row items-end justify-center gap-2 bg-gradient-to-t from-neutral-1100 to-neutral-1100/0 px-8 text-neutral-300"
          style={{
            animationDelay: '400ms',
          }}
        >
          <div className="mb-24 flex flex-row items-center gap-2 rounded-full bg-neutral-1100/80 px-6 py-2.5 text-sm sm:mb-8 sm:bg-neutral-1100/50">
            Backed by <YCIcon className="h-6 w-6" /> Combinator
          </div>
        </div>
      </div>
    </>
  );
};
