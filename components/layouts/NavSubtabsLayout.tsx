import cn from 'classnames';
import Head from 'next/head';
import { FC, ReactNode } from 'react';

import { NavLayout } from './NavLayout';
import SubTabs, { SubTabItem } from './SubTabs';

export type NavSubtabsLayoutProps = {
  title: string;
  titleComponent?: ReactNode;
  noHeading?: boolean;
  width?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  subTabItems?: SubTabItem[];
  SubHeading?: ReactNode;
  RightHeading?: ReactNode;
  children?: ReactNode;
};

export const NavSubtabsLayout: FC<NavSubtabsLayoutProps> = ({
  title,
  titleComponent,
  noHeading,
  width: w,
  subTabItems,
  SubHeading,
  RightHeading,
  children,
}) => {
  const width = !w ? 'lg' : w;

  return (
    <>
      <Head>
        <title>{`${title} | Markprompt`}</title>
      </Head>
      <NavLayout>
        <div className="fixed inset-x-0 top-[var(--app-navbar-height)] z-10 h-[var(--app-tabbar-height)] bg-neutral-1100">
          {subTabItems && <SubTabs items={subTabItems} />}
        </div>
        <div
          className={cn('relative mx-auto px-4 md:px-8', {
            'max-w-screen-2xl': width === '2xl',
            'max-w-screen-xl': width === 'xl',
            'max-w-screen-lg': width === 'lg',
            'max-w-screen-md': width === 'md',
            'max-w-screen-sm': width === 'sm',
            'max-w-md': width === 'xs',
            'pt-32': noHeading,
            'pt-24': !noHeading,
          })}
        >
          {!noHeading && (
            <div className="mb-4 flex flex-col pt-8">
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
          )}
          {children}
        </div>
      </NavLayout>
    </>
  );
};
