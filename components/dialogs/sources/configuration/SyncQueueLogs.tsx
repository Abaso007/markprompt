import cn from 'classnames';
import { parseISO, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { uniqBy } from 'lodash-es';
import { ChevronRight } from 'lucide-react';
import { FC, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

import { SkeletonTable } from '@/components/ui/Skeletons';
import { formatShortTimeInTimeZone, formatSystemDateTime } from '@/lib/date';
import useSource from '@/lib/hooks/use-source';
import { fetcher } from '@/lib/utils';
import { pluralize, removeConsecutiveDuplicates } from '@/lib/utils.nodeps';
import {
  DbSource,
  DbSyncQueueLog,
  DbSyncQueueOverview,
  LogLevel,
  Project,
} from '@/types/types';

import { LogLevelTag, SyncQueueTag } from './utils';

type LogMessagesProps = {
  projectId: Project['id'];
  syncQueueId: DbSyncQueueOverview['id'];
};

type LogMessage = {
  level: LogLevel;
  message: string;
  timestamp: string;
};

const LogMessages: FC<LogMessagesProps> = ({ projectId, syncQueueId }) => {
  const { data: logs, error } = useSWR(
    projectId && syncQueueId
      ? `/api/project/${projectId}/syncs/${syncQueueId}/logs`
      : null,
    fetcher<DbSyncQueueLog[]>,
    {
      // Refresh every 5 seconds
      refreshInterval: 5000,
    },
  );

  const loading = !logs && !error;

  const uniqueLogs = useMemo(() => {
    if (!logs) {
      return undefined;
    }
    // Duplicate logs may be appended, e.g. when Inngest reruns a function.
    // We don't want to show subsequent identical logs.
    return removeConsecutiveDuplicates(logs, (l1, l2) => {
      return l1.level === l2.level && l1.message === l2.message;
    });
  }, [logs]);

  return (
    <div className="relative flex w-full flex-col pb-4">
      {loading && (
        <div className="h-[130px] w-full p-4">
          <div className="relative">
            <SkeletonTable onDark loading={loading} />
          </div>
        </div>
      )}
      <div className="px-4 text-xs">
        {uniqueLogs && (
          <div className="flex flex-col border-l border-neutral-800 py-2 pl-4">
            {uniqueLogs.length > 0 &&
              uniqueLogs.map((log: LogMessage, i) => {
                return (
                  <div className="flex flex-row gap-4 py-2" key={`log-${i}`}>
                    <div className="w-[70px] flex-none whitespace-nowrap font-mono text-xs text-neutral-100">
                      {formatShortTimeInTimeZone(parseISO(log.timestamp), true)}
                    </div>
                    <div className="w-[70px] flex-none whitespace-nowrap text-xs">
                      <LogLevelTag level={log.level} />
                    </div>
                    <div className="flex-grow font-mono text-neutral-100">
                      {log.message}
                    </div>
                  </div>
                );
              })}
            {uniqueLogs && uniqueLogs.length === 0 && (
              <p className="flex-grow font-mono text-neutral-100">
                No logs found.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

type LogEntryProps = {
  projectId: Project['id'];
  syncQueue: DbSyncQueueOverview;
};

const LogEntry: FC<LogEntryProps> = ({ projectId, syncQueue }) => {
  const [isOpen, setOpen] = useState(false);

  const duration = useMemo(() => {
    if (!syncQueue.ended_at) {
      return undefined;
    }

    const start = parseISO(syncQueue.created_at);
    const end = syncQueue.ended_at ? parseISO(syncQueue.ended_at) : new Date();
    const diff = differenceInMinutes(end, start);
    if (diff < 1) {
      return `${pluralize(
        differenceInSeconds(end, start),
        'second',
        'seconds',
      )}`;
    } else {
      return `${pluralize(diff, 'minute', 'minutes')}`;
    }
  }, [syncQueue.created_at, syncQueue.ended_at]);

  return (
    <div className="flex w-full flex-col items-center">
      <div
        className={cn(
          'flex w-full cursor-pointer flex-row items-center gap-4 px-4  py-2 transition hover:bg-neutral-900',
          {
            'bg-neutral-900': isOpen,
          },
        )}
        onClick={() => {
          setOpen((o) => !o);
        }}
      >
        <div className="w-[200px] flex-none whitespace-nowrap font-mono text-xs text-neutral-400">
          {formatSystemDateTime(parseISO(syncQueue.created_at), true)}
        </div>
        <div className="w-[160px] flex-none whitespace-nowrap font-mono text-xs text-neutral-400">
          {duration || ''}
        </div>
        <div className="flex flex-grow items-center justify-end">
          <SyncQueueTag status={syncQueue.status} />
        </div>
        <ChevronRight
          className={cn(
            'z-0 h-4 w-4 flex-none transform text-neutral-500 transition',
            {
              'rotate-90': isOpen,
            },
          )}
        />
      </div>
      {isOpen && (
        <LogMessages projectId={projectId} syncQueueId={syncQueue.id} />
      )}
    </div>
  );
};

type SyncQueueLogsProps = {
  projectId: Project['id'];
  source: DbSource;
};

const NUM_LOGS = 20;

export const SyncQueueLogs: FC<SyncQueueLogsProps> = ({
  projectId,
  source,
}) => {
  const { currentStatus } = useSource(source);

  const {
    data: syncQueues,
    mutate: mutateSyncQueues,
    error,
  } = useSWR(
    projectId && source?.id
      ? `/api/project/${projectId}/sources/${source?.id}/syncs/overview?limit=${NUM_LOGS}`
      : null,
    fetcher<DbSyncQueueOverview[]>,
  );

  useEffect(() => {
    mutateSyncQueues();
  }, [currentStatus, mutateSyncQueues]);

  const loading = !syncQueues && !error;

  if (loading) {
    return (
      <div className="min-h-[200px] p-4">
        <div className="relative">
          <SkeletonTable onDark loading />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {syncQueues && syncQueues?.length > 0 ? (
        <div className="relative flex h-full w-full flex-col items-center overflow-y-auto pb-8 text-neutral-300">
          <div className="sticky top-0 z-10 mb-4 flex w-full flex-row items-center gap-4 border-b border-neutral-900 bg-neutral-1000 py-2 px-4 pb-2 text-xs text-neutral-500">
            <div className="w-[200px] flex-none">Started</div>
            <div className="w-[160px] flex-none">Duration</div>
            <div className="flex flex-grow items-center justify-end">
              Status
            </div>
            <div className="h-4 w-4" />
          </div>
          {syncQueues.map((q, i) => {
            return (
              <LogEntry
                key={`sync-queue-${i}`}
                projectId={projectId}
                syncQueue={q}
              />
            );
          })}
          {syncQueues?.length >= NUM_LOGS && (
            <p className="w-full px-4 pt-4 text-xs text-neutral-600">
              Showing {NUM_LOGS} most recent logs
            </p>
          )}
        </div>
      ) : (
        <p className="p-4 text-sm text-neutral-500">
          No sync has been initiated. Press &ldquo;Sync now&rdquo; to start a
          sync.
        </p>
      )}
    </div>
  );
};
