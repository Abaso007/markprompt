import cn from 'classnames';
import { FC, ReactNode } from 'react';

export type LayoutTitleProps = {
  title: string;
  titleComponent?: ReactNode;
  SubHeading?: ReactNode;
  RightHeading?: ReactNode;
  noPadding?: boolean;
};

export const LayoutTitle: FC<LayoutTitleProps> = ({
  title,
  titleComponent,
  SubHeading,
  RightHeading,
  noPadding,
}) => {
  return (
    <div
      className={cn('mb-4 flex flex-col pt-8', {
        'pt-8': !noPadding,
      })}
    >
      <div className="flex flex-col gap-4 sm:h-12 sm:flex-row sm:items-center">
        <h1 className="truncate whitespace-nowrap text-2xl font-bold text-white">
          {titleComponent ?? title}
        </h1>
        {RightHeading && (
          <>
            <div className="flex-grow" />
            <div className="flex-none">{RightHeading}</div>
          </>
        )}
      </div>
      {SubHeading}
    </div>
  );
};
