import classNames from 'classnames';
import { FC, ReactNode } from 'react';

import { TagColor } from '@/types/types';

type TagProps = {
  className?: string;
  color?: TagColor;
  size?: 'xs' | 'sm' | 'base';
  rounded?: boolean;
  inverted?: boolean;
  children: ReactNode;
};

export const Tag: FC<TagProps> = ({
  className,
  color = 'fuchsia',
  size = 'sm',
  rounded,
  inverted,
  children,
}) => {
  return (
    <span
      className={classNames(
        className,
        'w-min transform gap-2 truncate whitespace-nowrap font-medium transition',
        {
          'rounded-full': !rounded,
          rounded: rounded,
          'bg-primary-900/20 text-primary-400':
            color === 'fuchsia' && !inverted,
          'bg-orange-900/20 text-orange-400': color === 'orange' && !inverted,
          'bg-sky-900/20 text-sky-400': color === 'sky' && !inverted,
          'bg-green-900/20 text-green-400': color === 'green' && !inverted,
          'bg-rose-900/20 text-rose-400': color === 'red' && !inverted,
          'bg-neutral-900 text-neutral-400': color === 'neutral' && !inverted,
          'bg-primary-100 text-primary-500': color === 'fuchsia' && inverted,
          'bg-orange-100 text-orange-500': color === 'orange' && inverted,
          'bg-sky-100 text-sky-500': color === 'sky' && inverted,
          'bg-green-100 text-green-500': color === 'green' && inverted,
          'bg-rose-100 text-rose-500': color === 'red' && inverted,
          'bg-neutral-100 text-neutral-500': color === 'neutral' && inverted,
          'px-3 py-1.5 text-sm': size === 'base',
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-2 py-[1px] text-[11px]': size === 'xs',
        },
      )}
    >
      {children}
    </span>
  );
};
