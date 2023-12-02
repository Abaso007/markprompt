import cn from 'classnames';
import { format, add } from 'date-fns';
import { CalendarIcon, ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { formatShortDateTimeInTimeZone } from '@/lib/date';
import { Database } from '@/types/supabase';
import {
  DateCountHistogramEntry,
  NangoIntegrationId,
  ReferenceWithOccurrenceCount,
} from '@/types/types';

import { QueriesHistogram } from '../insights/queries-histogram';
import { TopReferences } from '../insights/top-references';
import Button from '../ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/Table';
import { Tag } from '../ui/Tag';

const sourceType = 'nango' as Database['public']['Enums']['source_type'];
const integrationIdWebsitePages = 'website-pages' as NangoIntegrationId;
const integrationIdNotionPages = 'notion-pages' as NangoIntegrationId;

const sampleTopReferences: ReferenceWithOccurrenceCount[] = [
  {
    title: 'Getting started',
    path: '/help/getting-started',
    sourceData: {
      integrationId: integrationIdWebsitePages,
      connectionId: '123',
      name: 'Markprompt blog',
    },
    sourceType,
    occurrences: 134,
  },
  {
    title: 'React tutorial',
    path: '/help/tutorials/react',
    sourceData: {
      integrationId: integrationIdNotionPages,
      connectionId: '123',
      name: 'Markprompt blog',
    },
    sourceType,
    occurrences: 121,
  },
  {
    title: 'Zendesk guide',
    path: '/blog/zendesk',
    sourceData: {
      integrationId: integrationIdWebsitePages,
      connectionId: '123',
      name: 'Markprompt blog',
    },
    sourceType,
    occurrences: 119,
  },
  {
    title: 'Blog',
    path: '/blog',
    sourceData: {
      integrationId: integrationIdWebsitePages,
      connectionId: '123',
      name: 'Markprompt blog',
    },
    sourceType,
    occurrences: 104,
  },
  {
    title: 'CLI',
    path: '/help/articles/cli',
    sourceData: {
      integrationId: integrationIdWebsitePages,
      connectionId: '123',
      name: 'Markprompt blog',
    },
    sourceType,
    occurrences: 97,
  },
  {
    title: 'FAQ',
    path: '/help/faq',
    sourceData: {
      integrationId: integrationIdNotionPages,
      connectionId: '123',
      name: 'Markprompt blog',
    },
    sourceType,
    occurrences: 83,
  },
].map((s) => ({ ...s, source_type: 'github', source_data: null }));

type Question = {
  question: string;
  unanswered?: boolean;
  feedback?: '1' | '-1';
  date: Date;
};

const sampleQuestions: Question[] = [
  {
    question:
      'How to re-fetch my content from the connected GitHub repository?',
    feedback: '1' as Question['feedback'],
  },
  { question: 'How can I trigger the component in React?' },
  { question: 'Explain how Acme uses embeddings and completions' },
  {
    question: 'Can I have multiple answer components?',
    unanswered: true,
    feedback: '-1' as Question['feedback'],
  },
  {
    question: 'Can I use one answer component per prompt?',
    unanswered: true,
  },
  {
    question: 'Where are the CSS variables located?',
    feedback: '1' as Question['feedback'],
  },
  { question: 'Explain how Acme works as a sequence diagram.' },
  {
    question: 'how do i create a custom template',
    unanswered: true,
  },
  { question: 'On which of the API does whitelist domain apply?' },
].map((q: Omit<Question, 'date'>, i) => {
  return {
    ...q,
    date: add(new Date(), { minutes: -20 * i - 10 * Math.random() }),
  };
});

const sampleQueriesHistogram: DateCountHistogramEntry[] = [
  903, 848, 740, 1003, 1014, 859, 992, 1023,
].map((c, i) => ({ count: c, date: add(new Date(), { days: -7 + i }) }));

export const InsightsExample = ({
  light,
  noDecorations,
}: {
  light?: boolean;
  noDecorations?: boolean;
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Prevent SSR/hydration errors.
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <></>;
  }

  const dateRange = {
    from: add(new Date(), { days: -7 }),
    to: new Date(),
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="col-span-2">
          {!light && (
            <>
              <h3 className="mb-4 text-xl font-bold text-neutral-300">
                Insights
              </h3>
              <div className="pointer-events-none hidden flex-row sm:flex">
                <Button
                  variant="plain"
                  left
                  light
                  buttonSize="sm"
                  asDropdown
                  squareCorners="right"
                  className="justify-start text-left font-normal"
                >
                  Past 7 days
                </Button>
                <Button
                  variant="plain"
                  left
                  light
                  buttonSize="sm"
                  squareCorners="left"
                  className="justify-start text-left font-normal"
                  Icon={(props) => (
                    <CalendarIcon
                      {...props}
                      className={cn(props.className, 'text-neutral-500')}
                    />
                  )}
                >
                  {format(dateRange.from, 'LLL dd, y')} -{' '}
                  {format(dateRange.to, 'LLL dd, y')}
                </Button>
              </div>
              <div className="pointer-events-none block sm:hidden">
                <Button
                  variant="plain"
                  left
                  light
                  buttonSize="sm"
                  asDropdown
                  className="justify-start text-left font-normal"
                >
                  Past 7 days
                </Button>
              </div>
              <h3 className="mb-4 mt-8 font-bold text-neutral-300">
                Latest questions
              </h3>
            </>
          )}
          <div className="overflow-x-auto">
            <Table>
              <colgroup>
                <col className="w-[400px] sm:w-[calc(50%-220px)]" />
                <col className="w-[100px]" />
                <col className="w-[150px]" />
                <col className="w-[190px]" />
              </colgroup>
              <TableHeader className="text-neutral-300">
                <TableRow light={light}>
                  <TableHead light={light}>Question</TableHead>
                  <TableHead light={light}>Feedback</TableHead>
                  <TableHead light={light}>Status</TableHead>
                  <TableHead light={light}>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleQuestions.map((q, i) => {
                  return (
                    <TableRow light={light} key={`sample-question-${i}`}>
                      <TableCell
                        className={cn('overflow-hidden truncate', {
                          'text-neutral-300': !light,
                          'text-neutral-500': light,
                        })}
                      >
                        {q.question}
                      </TableCell>
                      <TableCell>
                        {q.feedback === '1' ? (
                          <ThumbsUpIcon
                            className={cn('h-4 w-4', {
                              'text-green-600': !light,
                              'text-green-400': light,
                            })}
                          />
                        ) : q.feedback === '-1' ? (
                          <ThumbsDownIcon
                            className={cn('h-4 w-4', {
                              'text-orange-600': !light,
                              'text-orange-400': light,
                            })}
                          />
                        ) : (
                          <></>
                        )}
                      </TableCell>
                      <TableCell>
                        {q.unanswered ? (
                          <Tag color="orange" inverted={light}>
                            Unanswered
                          </Tag>
                        ) : (
                          <Tag color="green" inverted={light}>
                            Answered
                          </Tag>
                        )}
                      </TableCell>
                      <TableCell className="text-neutral-500">
                        {formatShortDateTimeInTimeZone(q.date)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
        <div>
          <h3
            className={cn('mb-4', {
              'font-bold text-neutral-300': !light,
              'font-medium text-neutral-500': light,
            })}
          >
            New questions
          </h3>
          <QueriesHistogram
            dateRange={dateRange}
            data={sampleQueriesHistogram}
            light={light}
            noDecorations={noDecorations}
          />
          <h3
            className={cn('mb-4 mt-8 font-bold', {
              'text-neutral-300': !light,
              'text-neutral-500': light,
            })}
          >
            Most cited sources
          </h3>
          {!light && <TopReferences topReferences={sampleTopReferences} />}
        </div>
      </div>
    </>
  );
};
