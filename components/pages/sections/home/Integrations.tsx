import cn from 'classnames';
import {
  Check,
  MessageCircleIcon,
  PenLine,
  RotateCw,
  Sticker,
} from 'lucide-react';
import { FC, JSXElementConstructor, ReactNode } from 'react';
import Balancer from 'react-wrap-balancer';

import { InsightsExample } from '@/components/examples/insights';
import { ZendeskIcon } from '@/components/icons/brands/Zendesk';
import { DiscordIcon } from '@/components/icons/Discord';
import { SalesforceFullIcon } from '@/components/icons/Salesforce';
import { SlackIcon } from '@/components/icons/Slack';

import { Input, Label } from './shared';

type CardProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export const Card: FC<CardProps> = ({ title, description, children }) => {
  return (
    <div className="group relative transform p-2">
      <div className="absolute inset-0 z-0 rounded-lg border border-dashed border-neutral-800 bg-neutral-1000 transition duration-300 group-hover:scale-[102%] group-hover:bg-neutral-950" />
      <div className="relative z-10 h-[240px] select-none overflow-hidden rounded bg-neutral-900 sm:h-[200px]">
        {children}
      </div>
      <div className="not-prose relative z-10 flex flex-col gap-4 px-4 py-6">
        <h2 className="text-xl font-semibold text-neutral-100">{title}</h2>
        <p className="text-base text-neutral-500">{description}</p>
      </div>
    </div>
  );
};

export const Integrations = () => {
  return (
    <div className="relative bg-neutral-1100 py-20">
      <div className="relative z-10 mx-auto grid max-w-screen-xl grid-cols-1 px-8 md:grid-cols-2">
        <h1 className="pb-8 text-left text-4xl font-semibold text-neutral-100 sm:text-4xl md:-mr-8">
          <Balancer>1-click integrations to get started</Balancer>
        </h1>
        <p className="col-start-1 text-lg text-neutral-500">
          Add integrations to your workflows and platforms in minutes, no
          engineering resources needed.
        </p>
      </div>
      <div className="mx-auto mt-16 grid max-w-screen-xl grid-cols-1 gap-8 px-8 sm:grid-cols-3">
        <Card
          title="Build with no-code tools"
          description="Configure the instructions, behavior and design of your chatbots and agent apps, and experiment with them in a playground environment before deploying."
        >
          <div className="h-full w-full bg-neutral-50 px-8 pt-8">
            <div className="h-full w-full overflow-hidden rounded-t-md border-t border-l border-r border-neutral-200/70 bg-white p-4 text-neutral-900 shadow-xl">
              <div className="grid w-full grid-cols-2 items-center gap-1">
                <Label size="md">Theme</Label>
                <Input size="md">Violet</Input>
                <Label size="md">Primary color</Label>
                <Input noContainer size="md">
                  <div className="flex w-full flex-row items-center overflow-hidden">
                    <div className="flex-grow overflow-hidden truncate">
                      #A855F7
                    </div>
                    <div className="h-3 w-3 flex-none rounded-sm bg-[#A855F7]" />
                  </div>
                </Input>
                <Label size="md">Instant search</Label>
                <div className="flex flex-row items-center justify-end">
                  <div className="opacity-0">
                    <Input size="md">Placeholder</Input>
                  </div>
                  <div className="flex w-6 flex-none flex-row items-center justify-end rounded-full border border-neutral-100 bg-neutral-50 p-0.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow" />
                  </div>
                </div>
                <Label size="md">Prompt</Label>
                <div className="opacity-0">
                  <Input size="md">Placeholder</Input>
                </div>
                <div className="col-span-2 -mt-1.5">
                  <Input size="md">
                    You are an expert support representative who loves to help
                    people! You answer in a friendly, professional and concise
                    tone.
                  </Input>
                </div>
              </div>
            </div>
          </div>
        </Card>
        <Card
          title="Deploy on all platforms"
          description="Deploy bots via Sunshine Conversations, on Slack or Discord, and use native agent apps on Zendesk and Salesforce. "
        >
          <div className="relative h-full w-full bg-white">
            <DiscordIcon className="absolute top-12 -left-4 w-[20%] text-[#5865F2]" />
            <SlackIcon className="absolute bottom-6 right-6 w-[20%]" />
            <ZendeskIcon className="absolute -bottom-6 left-[30%] w-[30%] text-[#03363D]" />
            <SalesforceFullIcon className="absolute -top-10 left-[40%] w-[40%] text-[#00A1E0]" />
          </div>
        </Card>
        <Card
          title="Learn from insights and improve"
          description="Learn how your customers and agents interact with your AI apps to spot deficiencies in your knowledge and address them."
        >
          <div className="relative h-full w-full bg-neutral-50">
            <div className="absolute right-16 top-10 sm:right-10">
              <div className="w-[800px] origin-top-right scale-50 shadow-2xl">
                <div className="pointer-events-none rounded-xl bg-white p-6">
                  <InsightsExample light noDecorations />
                </div>
              </div>
            </div>
          </div>
          {/* <div className="grid h-full w-full grid-cols-3 items-center justify-center bg-neutral-50 p-4 sm:grid-cols-3">
            <div className="rounded-full border border-dashed border-neutral-200/70 bg-white">
              <MessageCircleIcon className="h-8 w-8 fill-sky-500/50" />
            </div>
          </div> */}
        </Card>
      </div>
    </div>
  );
};
