import cn from 'classnames';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { JSXElementConstructor, ReactNode } from 'react';

export const Button = ({
  className,
  color,
  size,
  as,
  children,
  ...rest
}: {
  className?: string;
  color?: 'violet' | 'sky' | 'black' | 'blackLight' | 'white' | 'whiteBordered';
  size?: 'xs' | 'md';
  as?: JSXElementConstructor<any> | string;
  children: ReactNode;
} & any) => {
  const Comp = as || 'div';
  return (
    <Comp
      className={cn(className, 'whitespace-nowrap text-center font-medium', {
        'bg-violet-600 text-white': color === 'violet',
        'bg-sky-600 text-white': color === 'sky',
        'bg-white text-neutral-900': color === 'white',
        'border border-neutral-200 bg-white text-neutral-900':
          color === 'whiteBordered',
        'bg-neutral-1000 text-white': color === 'black',
        'border border-neutral-200 bg-neutral-100 text-neutral-900':
          color === 'blackLight',
        'rounded px-2 py-1 text-[9px]': size !== 'xs' && size !== 'md',
        'rounded px-2 py-1 text-[11px]': size === 'md',
        'rounded-[3px] px-1.5 py-[3px] text-[8px]': size === 'xs',
      })}
      {...rest}
    >
      {children}
    </Comp>
  );
};

export const ButtonNormal = ({
  className,
  color,
  size,
  as,
  children,
  ...rest
}: {
  className?: string;
  color?: 'violet' | 'sky' | 'black' | 'blackLight' | 'white' | 'whiteBordered';
  size?: 'xs' | 'md';
  as?: JSXElementConstructor<any> | string;
  children: ReactNode;
} & any) => {
  const Comp = as === 'Link' ? Link : as || 'div';
  return (
    <Comp
      className={cn(
        className,
        'home-border-button mt-8 flex-none select-none justify-self-start whitespace-nowrap rounded-md px-4 py-2 font-medium outline-none ring-sky-500 ring-offset-0 ring-offset-neutral-900 transition focus:ring',
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
};

export const Label = ({
  className,
  size,
  children,
}: {
  className?: string;
  size?: 'md';
  children: ReactNode;
}) => {
  return (
    <span
      className={cn(className, 'text-bold mt-0.5 font-semibold', {
        'text-[9px]': size !== 'md',
        'text-[11px]': size === 'md',
      })}
    >
      {children}
    </span>
  );
};

export const Input = ({
  className,
  checked,
  size,
  multiline,
  noContainer,
  children,
}: {
  className?: string;
  checked?: boolean;
  size?: 'md';
  multiline?: boolean;
  noContainer?: boolean;
  children?: ReactNode;
}) => {
  return (
    <div
      className={cn(
        className,
        'flex flex-row gap-2 rounded border border-neutral-100 px-1.5 text-neutral-900',
        {
          'items-start py-1.5': multiline,
          'items-center py-1': !multiline,
          'text-[9px]': size !== 'md',
          'text-[11px]': size === 'md',
        },
      )}
    >
      {noContainer ? children : <div className="flex-grow">{children}</div>}
      {checked && (
        <div
          className={cn('flex-none rounded-full bg-lime-500 p-[1px]', {
            'mt-0.5': multiline,
          })}
        >
          <Check className="h-1.5 w-1.5 text-white" strokeWidth={4} />
        </div>
      )}
    </div>
  );
};
