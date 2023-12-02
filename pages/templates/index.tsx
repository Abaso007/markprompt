import { ChevronRight } from 'lucide-react';
import { InferGetStaticPropsType } from 'next';
import { FC, ReactNode } from 'react';

import { LandingLayout } from '@/components/layouts/LandingLayout';
import { LargeSection } from '@/components/layouts/Pages';
import { AIAgent } from '@/components/pages/previews/ai-agent';
import { TicketDeflection } from '@/components/pages/previews/ticket-deflection';
import { getIndexPageStaticProps } from '@/lib/pages';

export const getStaticProps = getIndexPageStaticProps;

type FeatureCardProps = {
  title: string;
  subtitle?: string;
  href: string;
  children?: ReactNode;
};

export const TemplateCard: FC<FeatureCardProps> = ({
  title,
  subtitle,
  href,
  children,
}) => {
  return (
    <a
      className="group relative flex transform flex-col rounded-lg border border-dashed border-neutral-800 bg-neutral-1000 p-2 transition duration-300 hover:-translate-y-2 hover:border-neutral-700 hover:bg-neutral-900 hover:shadow-xl"
      target="_blank"
      rel="noreferrer"
      href={href}
    >
      <div className="h-[240px] flex-none overflow-hidden rounded bg-neutral-50 px-4 pt-4 shadow-lg">
        {children}
      </div>
      <div className="not-prose relative z-10 flex flex-grow flex-col gap-1 px-4 pt-4 pb-4">
        <h2 className="flex-none translate-y-2 transform text-xl font-semibold text-neutral-100 transition duration-300 group-hover:translate-y-1">
          {title}
        </h2>
        {subtitle && (
          <p className="flex-none translate-y-2 transform text-neutral-500 transition duration-300 group-hover:translate-y-1">
            {subtitle}
          </p>
        )}
        <div className="flex-grow" />
        <p className="mt-2 flex flex-none translate-y-4 transform flex-row items-center gap-1 text-sm font-medium text-sky-500 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          View source{' '}
          <ChevronRight className="mt-[1px] h-3.5 w-3.5" strokeWidth={3} />
        </p>
      </div>
    </a>
  );
};

const Templates = () => {
  return (
    <LargeSection>
      <div className="mt-24 grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
        <TemplateCard
          title="Ticket deflector"
          subtitle="A form that answers questions and fills itself."
          href="https://github.com/motifland/templates/tree/main/ticket-deflector"
        >
          <TicketDeflection />
        </TemplateCard>
        <TemplateCard
          title="AI automations"
          subtitle="A chatbot that trigger automations, such as reimbursements, cancelations, or customer information lookup."
          href="https://github.com/motifland/templates/tree/main/ai-automations"
        >
          <AIAgent noAnimation />
        </TemplateCard>
      </div>
    </LargeSection>
  );
};

const TemplatesWithLayout: FC<
  InferGetStaticPropsType<typeof getIndexPageStaticProps>
> = ({ stars, status }) => {
  return (
    <LandingLayout
      pageTitle="Templates"
      heading="Start with a template"
      subheading="Build your bespoke AI support system by starting with a template."
      stars={stars}
      status={status}
    >
      <Templates />
    </LandingLayout>
  );
};

export default TemplatesWithLayout;
