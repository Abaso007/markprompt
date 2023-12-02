import { ReactNode } from 'react';

import { cn } from '@/lib/ui';

export const LargeSection = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div className={cn(className, 'px-6 sm:px-8')}>
      <div className="mx-auto w-full max-w-screen-lg">{children}</div>
    </div>
  );
};

export const XLSection = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div className={cn(className, 'px-6 sm:px-8')}>
      <div className="mx-auto w-full max-w-screen-xl">{children}</div>
    </div>
  );
};
