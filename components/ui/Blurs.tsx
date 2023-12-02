import cn from 'classnames';

export const Blurs = ({ animated }: { animated?: boolean }) => (
  <div className="pointer-events-none absolute left-[-300px] right-[-300px] top-[-200px] bottom-[-200px] z-0 hidden opacity-30 sm:block">
    <div
      className={cn(
        'absolute left-[200px] top-[100px] z-10 h-[300px] w-[500px] rotate-[20deg] transform rounded-full bg-sky-500 blur-[200px]',
        {
          'animate-pulse-slow': animated,
        },
      )}
    />
    <div className="absolute right-[100px] top-[200px] z-10 h-[150px] w-[400px] rotate-[80deg] transform rounded-full bg-fuchsia-500 blur-[150px]" />
    <div className="absolute left-[150px] bottom-[200px] z-10 h-[200px] w-[500px] rotate-[30deg] transform rounded-full bg-violet-500 blur-[200px]" />
  </div>
);

type Color = 'sky' | 'lime' | 'rose' | 'orange' | 'yellow' | 'violet';

export const ColoredBlurs = ({
  className,
  color1,
  color2,
  alt,
}: {
  className?: string;
  color1: Color;
  color2: Color;
  alt?: boolean;
}) => (
  <div className={cn(className, 'absolute')}>
    <div
      className={cn(
        'absolute h-[150px] w-[300px] rotate-[20deg] transform rounded-full blur-[70px]',
        {
          'left-[100px] top-0': !alt,
          'left-[-50px] top-[200px]': alt,
          'bg-lime-300': color1 === 'lime',
          'bg-yellow-300': color1 === 'yellow',
          'bg-orange-300': color1 === 'orange',
          'bg-rose-300': color1 === 'rose',
          'bg-sky-300': color1 === 'sky',
          'bg-violet-300': color1 === 'violet',
        },
      )}
    />
    <div
      className={cn(
        'absolute left-[150px] bottom-[00px] z-10 h-[200px] w-[500px] rotate-[30deg] transform rounded-full blur-[70px]',
        {
          'bg-lime-300': color2 === 'lime',
          'bg-yellow-300': color2 === 'yellow',
          'bg-orange-300': color2 === 'orange',
          'bg-rose-300': color2 === 'rose',
          'bg-sky-300': color2 === 'sky',
          'bg-violet-300': color2 === 'violet',
        },
      )}
    />
  </div>
);
