import { InferGetStaticPropsType } from 'next';
import Link from 'next/link';
import { FC, JSXElementConstructor, ReactNode } from 'react';

import { AlgoliaIcon } from '@/components/icons/brands/Algolia';
import { FrontIcon } from '@/components/icons/brands/Front';
import { HubSpotIcon } from '@/components/icons/brands/HubSpotIcon';
import { JiraIcon } from '@/components/icons/brands/Jira';
import { NotionIcon } from '@/components/icons/brands/Notion';
import { SalesforceIcon } from '@/components/icons/brands/Salesforce';
import { SlackIcon } from '@/components/icons/brands/Slack';
import { ZendeskIcon } from '@/components/icons/brands/Zendesk';
import { DiscordIcon } from '@/components/icons/Discord';
import { GitHubIcon } from '@/components/icons/GitHub';
import { LandingLayout } from '@/components/layouts/LandingLayout';
import { LargeSection } from '@/components/layouts/Pages';
import { Tag } from '@/components/ui/Tag';
import { useContactDialogContext } from '@/lib/context/contact-dialog';
import { getIndexPageStaticProps } from '@/lib/pages';
import { cn } from '@/lib/ui';

export const getStaticProps = getIndexPageStaticProps;

type IntegrationSpec = {
  name: string;
  description: string;
  Icon: JSXElementConstructor<any>;
  status?: 'dev' | 'soon';
  href?: string;
};

const integrations: IntegrationSpec[] = [
  {
    name: 'GitHub',
    description: 'Sync your repo, discussions and issues',
    Icon: GitHubIcon,
  },
  {
    name: 'Salesforce Knowledge',
    description: 'Sync your knowledge base articles',
    Icon: SalesforceIcon,
  },
  {
    name: 'Salesforce Case',
    description: 'Sync your case resolutions',
    Icon: SalesforceIcon,
  },
  {
    name: 'Salesforce AI Drafts',
    description: 'Automatically generate case replies',
    Icon: SalesforceIcon,
    href: '/integrations/salesforce-ai-drafts',
  },
  {
    name: 'Zendesk Articles',
    description: 'Sync your knowledge base articles',
    Icon: ZendeskIcon,
    status: 'dev',
  },
  {
    name: 'Zendesk Drafts',
    description: 'Automatically draft customer replies',
    Icon: ZendeskIcon,
  },
  {
    name: 'Zendesk Bot',
    description: 'Answer customers automatically',
    Icon: ZendeskIcon,
    status: 'soon',
  },
  {
    name: 'Atlassian Jira',
    description: 'Sync your knowledge base articles',
    Icon: JiraIcon,
    status: 'dev',
  },
  {
    name: 'Front Drafts',
    description: 'Automatically draft customer replies',
    Icon: FrontIcon,
    status: 'soon',
  },
  {
    name: 'Notion',
    description: 'Sync your workspace pages',
    Icon: NotionIcon,
  },
  {
    name: 'HubSpot',
    description: 'Sync your knowledge base articles',
    Icon: HubSpotIcon,
    status: 'soon',
  },
  {
    name: 'Algolia',
    description: 'Combine LLM prompts with instant search',
    Icon: AlgoliaIcon,
    href: '/blog/algolia',
  },
  {
    name: 'Discord',
    description: 'Answer customers automatically',
    Icon: DiscordIcon,
  },
  {
    name: 'Slack',
    description: 'Answer customers automatically',
    Icon: SlackIcon,
    status: 'dev',
  },
];

const Card: FC<IntegrationSpec> = ({
  name,
  description,
  status,
  href,
  Icon,
}) => {
  const Comp = href
    ? ({ className, children }: { className: string; children: ReactNode }) => {
        return (
          <Link
            className={cn(
              className,
              'bg-neutral-1000 no-underline transition duration-300 hover:bg-neutral-900',
            )}
            href={href}
          >
            {children}
          </Link>
        );
      }
    : 'div';

  return (
    <Comp
      className={cn(
        'not-prose home-with-ring flex min-h-[160px] flex-col rounded-md border bg-neutral-1000 p-6',
        {
          'border-dashed border-neutral-900': !href,
          'border-neutral-800': href,
        },
      )}
    >
      <div className="flex flex-row items-center gap-4">
        <div className="flex h-12 flex-none items-center justify-center">
          <Icon className="w-8 flex-none text-white" />
        </div>
        <div className="flex flex-col gap-1 overflow-hidden">
          <h3 className="overflow-hidden truncate whitespace-nowrap text-base font-semibold text-neutral-100">
            {name}
          </h3>
          {status && (
            <Tag color={status === 'dev' ? 'orange' : 'sky'}>
              {status === 'dev' ? 'In development' : 'Soon'}
            </Tag>
          )}
        </div>
      </div>
      <h3 className="mt-4 text-sm font-normal text-neutral-500">
        {description}
      </h3>
      {href && (
        <p className="subtle-underline mt-4 place-self-start text-sm text-neutral-300">
          Learn more
        </p>
      )}
    </Comp>
  );
};

const Integrations = () => {
  const { setContactDialogOpen } = useContactDialogContext();

  return (
    <LargeSection>
      <button
        className="mt-6 select-none justify-self-start whitespace-nowrap rounded-lg border-0 bg-white px-5 py-2 font-medium text-neutral-900 outline-none ring-sky-500 ring-offset-0 ring-offset-neutral-900 transition hover:bg-white/80 focus:ring"
        aria-label="Request integration"
        onClick={() => setContactDialogOpen(true)}
      >
        Request integration
      </button>
      <div className="mt-24 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        {integrations.map((integration, i) => {
          return (
            <Card
              key={`integration-${integration.name}-${i}`}
              {...integration}
            />
          );
        })}
      </div>
    </LargeSection>
  );
};

const IntegrationsWithLayout: FC<
  InferGetStaticPropsType<typeof getIndexPageStaticProps>
> = ({ stars, status }) => {
  return (
    <LandingLayout
      pageTitle="Integrations"
      heading="Integrations"
      subheading="Connect data sources and deploy across all distribution channels using integrations with your existing tools."
      stars={stars}
      status={status}
    >
      <Integrations />
    </LandingLayout>
  );
};

export default IntegrationsWithLayout;
