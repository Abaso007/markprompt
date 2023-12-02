import cn from 'classnames';
import {
  Check,
  ChevronsUpDown,
  Globe,
  MoreHorizontal,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { JSXElementConstructor, ReactNode } from 'react';
import Balancer from 'react-wrap-balancer';

import { ConfluenceIcon } from '@/components/icons/brands/Confluence';
import { FrontIcon } from '@/components/icons/brands/Front';
import { GitBookIcon } from '@/components/icons/brands/GitBook';
import { HubSpotIcon } from '@/components/icons/brands/HubSpotIcon';
import { ZendeskIcon } from '@/components/icons/brands/Zendesk';
import { GitHubIcon } from '@/components/icons/GitHub';
import { MarkpromptIcon } from '@/components/icons/Markprompt';
import { NotionIcon } from '@/components/icons/Notion';
import {
  SalesforceIcon,
  SalesforceFullIcon,
} from '@/components/icons/Salesforce';
import { DbSyncQueueOverview } from '@/types/types';

import { Button } from './shared';

const SquareEmptySVG = ({ className }: { className: string }) => {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <path fill="none" />
    </svg>
  );
};

const Source = ({
  status,
  Icon,
  children,
}: {
  status?: DbSyncQueueOverview['status'];
  Icon: JSXElementConstructor<any>;
  children: ReactNode;
}) => {
  return (
    <div className="flex flex-row items-center gap-2 overflow-hidden truncate text-xs text-neutral-500">
      <Icon className="h-3 w-3 flex-none" />
      <div className="flex-grow overflow-hidden truncate text-[10px]">
        {children}
      </div>
      {status === 'complete' && (
        <Check className="h-2 w-2 flex-none text-green-600" />
      )}
      {status === 'running' && (
        <RefreshCw className="h-2 w-2 flex-none animate-spin text-neutral-600" />
      )}
      <MoreHorizontal className="h-2 w-2 flex-none text-neutral-700" />
    </div>
  );
};

const Connector = ({
  label,
  Icon,
}: {
  label: string;
  Icon: JSXElementConstructor<any>;
}) => {
  return (
    <Link
      href="/integrations"
      className="group relative flex select-none items-center justify-center p-2 md:p-6"
    >
      <div className="absolute inset-0 z-0 rounded-md border border-neutral-900 bg-neutral-1100 p-4 transition duration-300 group-hover:border group-hover:border-lime-400 group-hover:bg-neutral-1000 sm:transform sm:group-hover:scale-[130%]" />
      <SquareEmptySVG className="relative z-10 h-full w-full" />
      <Icon className="absolute z-10 h-8 w-8 transform text-neutral-500 transition duration-300 group-hover:text-neutral-100 sm:h-6 sm:w-6 sm:text-neutral-600 sm:group-hover:-translate-y-3 md:h-6 md:w-6 lg:h-8 lg:w-8" />
      <p className="absolute inset-x-0 bottom-0 z-10 flex h-9 translate-y-3 transform items-center justify-center text-center text-xs font-medium text-neutral-100 opacity-0 transition duration-300 sm:text-[9px] sm:group-hover:translate-y-2 sm:group-hover:opacity-100 lg:text-xs">
        <span className="leading-none">{label}</span>
      </p>
    </Link>
  );
};

export const ExpertKnowledge = () => {
  return (
    <div className="relative bg-neutral-1100 py-20">
      <div className="absolute inset-x-0 top-0 z-10 h-[500px] bg-gradient-to-b from-neutral-1100 to-neutral-1100/0" />
      <div className="absolute inset-x-0 bottom-0 z-10 h-[500px] bg-gradient-to-t from-neutral-1100 to-neutral-1100/0" />
      <div className="home-dots absolute inset-0" />
      <div className="relative z-10 mx-auto grid max-w-screen-xl grid-cols-1 px-6 sm:px-8 md:grid-cols-2">
        <h1 className="pb-8 text-left text-4xl font-semibold text-neutral-100 sm:text-4xl md:-mr-8">
          <Balancer>Pull in expert knowledge from anywhere</Balancer>
        </h1>
        <p className="col-start-1 text-lg text-neutral-500">
          Generate answers based on all knowledge available, internal and
          external. With auto-sync, it is always up to date.
        </p>
      </div>
      <div className="relative z-10 mt-8 md:-mt-8">
        <div className="mt-8 grid w-full grid-cols-1 items-center gap-y-8 px-6 sm:px-8 md:grid-cols-8 md:px-0">
          <div className="col-span-3 md:col-span-3 md:col-start-2">
            <div className="grid grid-cols-5 gap-4 md:grid-cols-6">
              <Connector Icon={GitHubIcon} label="GitHub Repo" />
              <div />
              <Connector Icon={NotionIcon} label="Notion" />
              <Connector
                Icon={SalesforceFullIcon}
                label="Salesforce Knowledge"
              />
              <div />
              <div />
              <div />
              <Connector
                Icon={(props) => <Globe {...props} strokeWidth={1.2} />}
                label="Website"
              />
              <Connector Icon={GitHubIcon} label="GitHub Discussions" />
              <div />
              <Connector Icon={ZendeskIcon} label="Zendesk" />
              <div />
              <div />
              <Connector Icon={SalesforceFullIcon} label="Salesforce Case" />
              <Connector Icon={HubSpotIcon} label="HubSpot" />
              <Connector Icon={GitBookIcon} label="GitBook" />
              <div />
              <div />
              <Connector Icon={FrontIcon} label="Front" />
              <Connector Icon={GitHubIcon} label="GitHub Issues" />
              <div />
              <div />
              <Connector Icon={ConfluenceIcon} label="Confluence" />
            </div>
          </div>
          <div className="col-span-4 ml-12 hidden select-none md:block">
            <div className="mt-[-100px] h-[600px] overflow-hidden rounded-l-md border-l border-t border-b border-neutral-900 bg-neutral-1050 shadow-2xl">
              <div className="flex flex-row items-center gap-2 border-b border-neutral-1000 py-1 px-4 text-[10px] font-medium text-neutral-800">
                <MarkpromptIcon className="mr-1 h-5 w-5 text-neutral-600" />
                <span className="text-neutral-800">/</span>
                <span>Acme</span>
                <ChevronsUpDown className="h-3 w-3 text-neutral-800" />
                <span className="text-neutral-800">/</span>
                <span>Support</span>
                <ChevronsUpDown className="h-3 w-3 text-neutral-800" />
              </div>
              <div className="flex flex-row items-center gap-4 border-b border-neutral-1000 py-1.5 px-4 text-[10px] font-medium text-neutral-800">
                <span className="text-neutral-100">Data</span>
                <span>Playground</span>
                <span>Insights</span>
                <span>Settings</span>
              </div>
              <div className="grid grid-cols-7">
                <div className="col-span-2 flex flex-col gap-2 p-4">
                  <p className="text-[9px] text-neutral-700">
                    Connected sources
                  </p>
                  <Source status="complete" Icon={GitHubIcon}>
                    globex/docs
                  </Source>
                  <Source status="complete" Icon={GitHubIcon}>
                    GitHub Discussions
                  </Source>
                  <Source status="running" Icon={SalesforceIcon}>
                    Salesforce Knowledge
                  </Source>
                  <Source status="complete" Icon={SalesforceIcon}>
                    Salesforce Case
                  </Source>
                  <Source status="complete" Icon={Globe}>
                    Globex Blog
                  </Source>
                  <Source status="complete" Icon={NotionIcon}>
                    Internal docs
                  </Source>
                  <Button color="white" size="xs" className="mt-4 w-full">
                    Connect source
                  </Button>
                </div>
                <div className="col-span-5 flex flex-col gap-1.5 overflow-hidden pl-2 pt-4">
                  <div className="flex flex-row items-center gap-2">
                    <div className="mb-4 h-4 w-20 rounded-full bg-neutral-1000" />
                    <div className="mb-4 h-4 w-12 rounded-full bg-neutral-1000" />
                  </div>
                  {Array.from(Array(25).keys()).map((_, i) => (
                    <div
                      key={`file-${i}`}
                      className="h-4 w-full rounded-l-sm bg-neutral-1000"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative z-10 mx-auto mt-8 flex max-w-screen-xl flex-row items-start justify-start gap-2 px-6 sm:px-8 md:mt-0 ">
          <ShieldCheck className="h-4 w-4 flex-none text-lime-600" />
          <p className="flex-grow text-xs text-neutral-500 md:max-w-[400px]">
            Markprompt is SOC 2 Type I compliant, and is actively pursuing SOC 2
            Type II compliance (February 2024). Markprompt encrypts all data at
            rest and in transit.
          </p>
        </div>
      </div>
    </div>
  );
};
