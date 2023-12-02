import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { FC, ReactNode } from 'react';

import { LandingLayout } from '@/components/layouts/LandingLayout';
import { LargeSection } from '@/components/layouts/Pages';
import { ButtonNormal } from '@/components/pages/sections/home/shared';
import { useContactDialogContext } from '@/lib/context/contact-dialog';
import { getIndexPageStaticProps } from '@/lib/pages';

export const getStaticProps: GetStaticProps = getIndexPageStaticProps;

const Card = ({
  title,
  description,
  cta,
  ctaHref,
  ctaAction,
  children,
}: {
  title: string;
  description: string;
  cta?: string;
  ctaHref?: string;
  ctaAction?: () => void;
  children?: ReactNode;
}) => {
  return (
    <div className="grid grid-cols-2 rounded-lg border border-neutral-900 bg-neutral-1000 shadow-2xl">
      <div className="flex flex-col items-start gap-4 p-6">
        <h2 className="text-2xl font-bold text-neutral-100">{title}</h2>
        <p className="text-base text-neutral-500">{description}</p>
        <ButtonNormal
          as={ctaHref ? 'Link' : 'button'}
          href={ctaHref}
          onClick={ctaAction}
        >
          {cta}
        </ButtonNormal>
      </div>
      <div className="p-2">
        <div className="h-full w-full rounded bg-neutral-950">{children}</div>
      </div>
    </div>
  );
};

const Pricing = () => {
  const { setContactDialogOpen } = useContactDialogContext();

  return (
    <>
      <LargeSection>
        <div className="mt-24 grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
          <Card
            title="Starter"
            description="To get started building"
            cta="Get started"
            ctaHref="/login"
          ></Card>
          <Card
            title="Enterprise"
            description="To get started building"
            cta="Contact sales"
            ctaAction={() => setContactDialogOpen(true)}
          ></Card>
        </div>
      </LargeSection>
    </>
  );
};

const PricingWithLayout: FC<
  InferGetStaticPropsType<typeof getIndexPageStaticProps>
> = ({ stars, status }) => {
  return (
    <LandingLayout
      pageTitle="Pricing"
      heading="Pricing tied to measurable outcomes"
      stars={stars}
      status={status}
    >
      <Pricing />
    </LandingLayout>
  );
};

export default PricingWithLayout;
