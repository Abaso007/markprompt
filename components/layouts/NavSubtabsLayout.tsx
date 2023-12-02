import cn from 'classnames';
import Head from 'next/head';
import { FC, ReactNode } from 'react';

import { LayoutTitle } from './LayoutTitle';
import { NavLayout } from './NavLayout';
import SubTabs, { SubTabItem } from './SubTabs';

export type NavSubtabsLayoutProps = {
  title: string;
  titleComponent?: ReactNode;
  noHeading?: boolean;
  noPadding?: boolean;
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
  noPadding,
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
          className={cn('relative mx-auto', {
            'max-w-screen-2xl': width === '2xl',
            'max-w-screen-xl': width === 'xl',
            'max-w-screen-lg': width === 'lg',
            'max-w-screen-md': width === 'md',
            'max-w-screen-sm': width === 'sm',
            'max-w-md': width === 'xs',
            'pt-32': noHeading,
            'pt-24': !noHeading || noPadding,
            'px-4 md:px-8': !noPadding,
          })}
        >
          {!noHeading && (
            <LayoutTitle
              title={title}
              titleComponent={titleComponent}
              SubHeading={SubHeading}
              RightHeading={RightHeading}
            />
          )}
          {children}
        </div>
      </NavLayout>
    </>
  );
};
