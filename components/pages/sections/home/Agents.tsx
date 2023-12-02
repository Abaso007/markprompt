import cn from 'classnames';
import { PenLine, RotateCw, Sticker } from 'lucide-react';
import { ReactNode } from 'react';
import Balancer from 'react-wrap-balancer';

import { ColoredBlurs } from '@/components/ui/Blurs';
import { formatShortDateTimeInTimeZone } from '@/lib/date';

import { Button, Input, Label } from './shared';
import { FeatureCard } from '../../components/FeatureCard';
import { AIAgent } from '../../previews/ai-agent';
import { TicketDeflection } from '../../previews/ticket-deflection';

export const Column = ({
  offset,
  children,
}: {
  offset?: boolean;
  children: ReactNode;
}) => {
  return (
    <div className={cn({ 'mt-32': offset }, 'flex flex-col gap-8')}>
      {children}
    </div>
  );
};

export const Agents = () => {
  return (
    <div className="relative bg-neutral-1100 py-20">
      <div className="relative z-10 mx-auto grid max-w-screen-xl grid-cols-1 px-6 sm:px-8 md:grid-cols-2">
        <h1 className="pb-8 text-left text-4xl font-semibold text-neutral-100 sm:text-4xl md:-mr-8">
          <Balancer>
            A suite of tools to scale your mighty customer support team
          </Balancer>
        </h1>
        <p className="col-start-1 text-lg text-neutral-500">
          Handle more support volume by giving your team AI superpowers instead
          of increasing headcount. Markprompt fits in at all touch points in the
          agent and customer journey.
        </p>
      </div>
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-y-8 gap-x-8 px-6 sm:grid-cols-2 sm:px-8">
        <Column offset>
          <FeatureCard
            Icon={Sticker}
            title="Ticket deflection"
            description="Reduce ticket volume by 50% overnight by answering customer questions automatically."
            href="/templates"
            hrefLabel="Explore templates"
          >
            <div className="relative h-full w-full select-none bg-neutral-50 px-8 pt-12 sm:px-12">
              <ColoredBlurs
                color1="lime"
                color2="sky"
                className="absolute inset-0 z-0 opacity-0  transition duration-500 group-hover:opacity-100"
              />
              <TicketDeflection />
            </div>
          </FeatureCard>
          <FeatureCard
            Icon={Sticker}
            title="Chatbots with automations"
            description="Build chatbots that trigger automations, such as reimbursements. Deploy standalone or within existing chatbots, such as Zendesk."
            href="/templates"
            hrefLabel="Explore templates"
          >
            <AIAgent withBlurs />
          </FeatureCard>
        </Column>
        <Column>
          <FeatureCard
            Icon={Sticker}
            title="Triage"
            description="Categorize, summarize, translate, preprocess tickets so you can take action with the full picture."
            href="/templates"
            hrefLabel="Explore templates"
          >
            <div className="relative h-full w-full select-none bg-neutral-50 px-8 sm:px-12">
              <ColoredBlurs
                color1="lime"
                color2="sky"
                className="absolute inset-0 z-0 opacity-0 transition duration-500 group-hover:opacity-100"
                alt
              />
              <div className="relative z-10 h-full border-l border-r border-neutral-200 bg-white px-4 pt-2 shadow-2xl">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-neutral-900">
                  <Label className="col-span-2">Product</Label>
                  <Input checked className="col-span-2">
                    Acme Platform
                  </Input>
                  <Label>Problem area</Label>
                  <Label>Severity level</Label>
                  <Input checked>Cron jobs</Input>
                  <Input checked>
                    <span className="h-[5px] w-[5px] rounded-full bg-red-500" />
                    High
                  </Input>
                  <Label className="col-span-2">Subject</Label>
                  <Input checked className="col-span-2">
                    Cron service is down
                  </Input>
                  <Label className="col-span-2">Message</Label>
                  <Input checked multiline className="col-span-2">
                    <div>
                      <p>
                        <span className="font-bold">Processed message:</span> We
                        are experiencing 404 errors on the cron endpoint since
                        this morning. Upon reviewing the logs, it appears that
                        this error is not properly detected.
                      </p>
                      <p className="mt-2 italic">
                        <span className="font-bold">Original message:</span>{' '}
                        Help! Cron is alwys retunning 404s now its happening all
                        the time since this morning!!! Ntohing to see in the
                        logs!
                      </p>
                    </div>
                  </Input>
                  <div className="col-span-2 mt-1 flex justify-start">
                    <Button color="black">Submit case</Button>
                  </div>
                </div>
              </div>
            </div>
          </FeatureCard>
          <FeatureCard
            Icon={Sticker}
            title="AI Draft Composer"
            href="/integrations"
            hrefLabel="Explore integrations"
            subtitle={
              <div className="-mt-2 flex justify-start">
                <div className="gap-2 rounded-md bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-500">
                  for Salesforce and Zendesk
                </div>
              </div>
            }
            description="Generate responses in a click, adhering to your company's brand and tone, based on expert knowledge."
          >
            <div className="relative h-full w-full select-none bg-neutral-50">
              <ColoredBlurs
                color1="lime"
                color2="sky"
                className="absolute inset-0 z-0 opacity-0  transition duration-500 group-hover:opacity-100"
              />
              <div className="absolute top-4 right-4 left-0 bottom-0 z-10 flex flex-row items-start gap-2 rounded-tr-md border-t border-r border-blue-200 bg-blue-100 pt-2 pr-2 shadow-xl sm:top-8 sm:right-8">
                <div className="flex h-full w-[100px] flex-none flex-col items-end gap-2 rounded-tr border-t border-r bg-white pt-2 pr-2">
                  <div className="flex w-full flex-col overflow-hidden rounded-r border-t border-r border-b border-neutral-200">
                    <div className="h-8 border-b border-neutral-200 bg-neutral-100" />
                    <div className="flex flex-row items-center justify-end gap-2 py-2 pr-2">
                      <div className="h-[18px] flex-grow rounded-r border-t border-r border-b border-neutral-200" />
                      <Button className="flex-none" color="sky" size="xs">
                        Compose
                      </Button>
                    </div>
                  </div>
                  <div className="rounded border border-neutral-200 bg-neutral-50 p-1 text-neutral-500">
                    <RotateCw className="h-2 w-2" />
                  </div>
                  <p className="text-right text-[7px] font-medium text-sky-600">
                    {formatShortDateTimeInTimeZone(new Date())}
                  </p>
                </div>
                <div className="flex-grow rounded border bg-white px-2 pt-1">
                  <div className="flex flex-row items-center gap-2 border-b border-neutral-100 text-[9px]">
                    <span className="px-1 py-0.5 text-neutral-500">
                      Details
                    </span>
                    <span className="border-b border-sky-500 px-1 py-0.5 font-medium text-neutral-900">
                      Markprompt
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 pb-2">
                    <div className="flex flex-row items-center gap-2 px-1 pt-1.5">
                      <div className="rounded-[3px] bg-neutral-900 p-0.5 text-white">
                        <PenLine className="h-2 w-2" />
                      </div>
                      <span className="mt-1 text-[9px] font-semibold text-neutral-900">
                        AI Draft Composer
                      </span>
                    </div>
                    <Input className="mt-1">
                      <div className="flex flex-col gap-1">
                        <p>Hi Tyler!</p>
                        <p>
                          Yes, the cancellation policy for a booked class may
                          vary depending on the studio you are booking with.
                          Generally, we allow you to cancel a class reservation
                          without any penalty up to 12 hours before the class
                          starts. However, if you cancel later than that, you
                          will be subject to a late cancellation fee. This fee
                          is deducted from your credits.
                        </p>
                        <p>Best,</p>
                        <p>Joshua</p>
                      </div>
                    </Input>
                    <div className="flex flex-row items-center gap-1">
                      <Button size="xs" color="sky">
                        Generate draft
                      </Button>
                      <Button size="xs" color="sky">
                        Insert reply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="mt-4 mr-4 h-full border-l border-r border-neutral-200 bg-white px-4 pt-2 shadow-2xl"></div> */}
            </div>
          </FeatureCard>
        </Column>
      </div>
    </div>
  );
};
