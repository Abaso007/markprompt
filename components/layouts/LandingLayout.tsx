import React, { FC, ReactNode, createContext } from 'react';
import Balancer from 'react-wrap-balancer';

import Footer from '@/components/pages/Footer';
import { ManagedContactDialogContext } from '@/lib/context/contact-dialog';
import { cn } from '@/lib/ui';
import { SystemStatus } from '@/types/types';

import { DotsBackground } from './Dots';
import { LargeSection } from './Pages';
import { MenuLarge } from '../pages/sections/home/MenuLarge';
import { SharedHead } from '../pages/SharedHead';

export const MarkdocContext = createContext<any>(undefined);

type LandingLayoutProps = {
  pageTitle: string;
  heading?: string;
  subheading?: string;
  stars: number;
  status: SystemStatus;
  exludePostfixFromTitle?: boolean;
  animateNavbar?: boolean;
  noDots?: boolean;
  huge?: boolean;
  children?: ReactNode;
};

const LandingLayoutWithoutContext: FC<LandingLayoutProps> = ({
  pageTitle,
  heading,
  subheading,
  stars,
  status,
  exludePostfixFromTitle,
  animateNavbar,
  noDots,
  huge,
  children,
}) => {
  return (
    <div className="relative">
      <SharedHead
        title={pageTitle}
        exludePostfixFromTitle={exludePostfixFromTitle}
      />
      <div className="relative flex w-full flex-col items-center justify-center">
        <MenuLarge animated={animateNavbar} />
        {!noDots && <DotsBackground />}
      </div>
      {(heading || subheading) && (
        <LargeSection className="relative">
          <div
            className={cn('relative text-neutral-100', {
              'pt-32': huge,
              'grid grid-cols-1 gap-4 pt-24 sm:grid-cols-2': !huge,
            })}
          >
            <div>
              {heading && (
                <h1
                  className={cn(
                    'mt-20 font-semibold text-neutral-100 sm:leading-[130%]',
                    {
                      'text-center text-4xl sm:text-5xl': huge,
                      'text-left text-3xl sm:text-4xl': !huge,
                    },
                  )}
                >
                  <Balancer>{heading}</Balancer>
                </h1>
              )}
            </div>
          </div>
          {subheading && (
            <h2
              className={cn('text-neutral-500', {
                'mt-8 text-center text-lg sm:text-xl': huge,
                'mt-4 max-w-[70%] text-left text-lg sm:text-xl': !huge,
              })}
            >
              <Balancer>{subheading}</Balancer>
            </h2>
          )}
        </LargeSection>
      )}
      <div className="relative">{children}</div>
      <Footer stars={stars} status={status} />
    </div>
  );
};

export const LandingLayout: FC<any> = (props) => {
  return (
    <ManagedContactDialogContext>
      <LandingLayoutWithoutContext {...props} />
    </ManagedContactDialogContext>
  );
};
