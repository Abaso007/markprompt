import type Nango from '@nangohq/frontend';
import { FC, useCallback, useState } from 'react';

import Button from '@/components/ui/Button';
import { addSource } from '@/lib/api';
import useSources from '@/lib/hooks/use-sources';
import {
  deleteConnection,
  setMetadata,
  triggerSyncs,
} from '@/lib/integrations/nango.client';
import { generateConnectionId } from '@/lib/utils';
import {
  DbSource,
  NangoIntegrationId,
  NangoSourceDataType,
  Project,
  SyncData,
} from '@/types/types';

import { Step, ConnectSourceStepState } from './Step';

export const createNangoConnection = async (
  nango: Nango,
  integrationId: NangoIntegrationId,
  connectionId: string,
  nangoConnectionConfigParams: Record<string, string> | undefined,
  authed: boolean,
) => {
  if (authed) {
    await nango.auth(integrationId, connectionId, nangoConnectionConfigParams);
  } else {
    await nango.create(integrationId, connectionId, {
      params: nangoConnectionConfigParams || {},
    });
  }
};

export const addSourceAndNangoConnection = async (
  nango: Nango,
  projectId: Project['id'],
  integrationId: NangoIntegrationId,
  name: string,
  // Nango-specific, like instance_url
  nangoConnectionConfigParams: Record<string, string> | undefined,
  // Info stored in Nango metadata (to use e.g. in a Nango sync) and in
  // the source data row in our database.
  syncMetadata: Record<string, string> | undefined,
  authed: boolean,
): Promise<DbSource | undefined> => {
  // Create the Nango connection. Note that nango.yaml specifies
  // `auto_start: false` to give us a chance to set the metadata
  // before we trigger the first sync.
  const connectionId = generateConnectionId();

  try {
    await createNangoConnection(
      nango,
      integrationId,
      connectionId,
      nangoConnectionConfigParams,
      authed,
    );

    const newSource = await addSource(projectId, 'nango', {
      integrationId,
      connectionId,
      name,
      connectionConfig: nangoConnectionConfigParams,
      syncMetadata,
    });

    if (!newSource.id) {
      throw new Error('Unable to create source');
    }

    if (syncMetadata) {
      await setMetadata(projectId, integrationId, connectionId, syncMetadata);
    }

    return newSource;
  } catch (e) {
    // If there is an error, make sure to delete the Nango connection
    try {
      deleteConnection(projectId, integrationId, connectionId);
    } catch {
      // No nothing
    }
    // Throw error from nango.auth to catch on the client side.
    throw e;
  }
};

export const triggerSyncsWithRecovery = async (
  nango: Nango,
  projectId: Project['id'],
  syncData: SyncData[],
  sources: Pick<DbSource, 'type' | 'data'>[],
) => {
  try {
    await triggerSyncs(projectId, syncData);
  } catch (e: any) {
    if (e.status === 404) {
      const connectionIds = (e as any).info?.data?.connectionIds as string[];
      if (connectionIds && connectionIds.length > 0) {
        const sourcesToRecover = sources.filter((s) => {
          const connectionId = (s.data as NangoSourceDataType)?.connectionId;
          return connectionId && connectionIds.includes(connectionId);
        });
        await recoverDeletedConnection(nango, projectId, sourcesToRecover);
        // Re-run syncs on recovered connections
        await triggerSyncs(
          projectId,
          syncData.filter(
            (d) => d.connectionId && connectionIds.includes(d.connectionId),
          ),
        );
      }
    } else {
      console.error(`Error running syncs: ${e}`);
    }
  }
};

const recoverDeletedConnection = async (
  nango: Nango,
  projectId: Project['id'],
  sources: Pick<DbSource, 'type' | 'data'>[],
) => {
  for (const source of sources) {
    try {
      const data = source.data as NangoSourceDataType;
      // We can reuse the previous (deleted) connection id so
      // that we don't need to update the database entries.
      await createNangoConnection(
        nango,
        data.integrationId,
        data.connectionId,
        data.connectionConfig,
        isIntegrationAuthed(data.integrationId),
      );

      // Set the Nango-specific metadata.
      if (data.syncMetadata) {
        await setMetadata(
          projectId,
          data.integrationId,
          data.connectionId,
          data.syncMetadata,
        );
      }
    } catch (e) {
      console.error(`Unable to recover source: ${e}`);
    }
  }
};

type SyncStepProps = {
  source: DbSource | undefined;
  state: ConnectSourceStepState;
  onComplete: () => void;
};

export const SyncStep: FC<SyncStepProps> = ({ source, state, onComplete }) => {
  const { syncSources } = useSources();
  const [syncStarted, setSyncStarted] = useState(false);

  const startSyncing = useCallback(async () => {
    if (!source) {
      return;
    }
    syncSources([source], (started) => {
      setSyncStarted(started);
      if (!started) {
        onComplete();
      }
    });
  }, [source, syncSources, onComplete]);

  return (
    <Step title="Sync" description="Start syncing your content." state={state}>
      <Button
        variant="cta"
        buttonSize="sm"
        onClick={startSyncing}
        disabled={state === 'not_started'}
        loading={syncStarted}
      >
        Start sync
      </Button>
    </Step>
  );
};

export const isIntegrationAuthed = (integrationId: NangoIntegrationId) => {
  switch (integrationId) {
    case 'website-pages':
      return false;
    default:
      return true;
  }
};
