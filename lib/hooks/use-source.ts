import { Connection } from '@nangohq/node/dist/types';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

import { DbSource, DbSyncQueueOverview } from '@/types/types';

import useProject from './use-project';
import useSources from './use-sources';
import { getSyncData } from '../integrations/nango';
import {
  stopSync as nangoStopSync,
  retrainOnly as nangoRetrainOnly,
} from '../integrations/nango.client';
import { fetcher, fetcherOrUndefined, formatUrl } from '../utils';

export default function useSource(source: DbSource | undefined) {
  const { project } = useProject();
  const { latestSyncQueues, mutateSyncQueues } = useSources();

  const { data: lastSyncQueue } = useSWR(
    project?.id && source?.id
      ? `/api/project/${project.id}/sources/${source.id}/syncs/last-sync`
      : null,
    fetcher<DbSyncQueueOverview>,
  );

  const syncData = source && getSyncData(source);

  const {
    data: _connectionData,
    mutate: mutateConnection,
    error: errorConnection,
  } = useSWR(
    project?.id && syncData?.integrationId && syncData?.connectionId
      ? formatUrl(
          `/api/project/${project.id}/integrations/nango/get-connection`,
          {
            integrationId: syncData.integrationId,
            connectionId: syncData.connectionId,
          },
        )
      : null,
    fetcherOrUndefined<{ connection: Connection }>,
  );

  const connection = useMemo(() => {
    if (errorConnection) {
      return undefined;
    }
    return _connectionData?.connection;
  }, [_connectionData, errorConnection]);

  const currentStatus = useMemo(() => {
    if (!source?.id) {
      return undefined;
    }
    return latestSyncQueues?.find((q) => q.source_id === source.id)?.status;
  }, [latestSyncQueues, source?.id]);

  const retrainOnly = useCallback(async () => {
    if (!project?.id || !source) {
      return;
    }

    const syncData = getSyncData(source);

    if (!syncData) {
      return;
    }

    const tid = toast.loading('Starting retraining...');

    await nangoRetrainOnly(project.id, syncData);

    toast.success('Retraining has been initiated', { id: tid });

    mutateSyncQueues();
  }, [project?.id, mutateSyncQueues, source]);

  const stopSync = useCallback(async () => {
    if (!project?.id || !source) {
      return;
    }

    const syncData = getSyncData(source);

    if (!syncData) {
      return;
    }

    const tid = toast.loading('Stopping sync...');

    await nangoStopSync(project.id, syncData);

    toast.success('Sync has been stopped', { id: tid });

    mutateSyncQueues();
    mutateConnection();
  }, [project?.id, mutateSyncQueues, mutateConnection, source]);

  return {
    currentStatus,
    lastSyncQueue,
    connection,
    retrainOnly,
    stopSync,
  };
}
