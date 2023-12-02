import type { NextApiRequest, NextApiResponse } from 'next';

import {
  getNangoServerInstance,
  getSourceId,
} from '@/lib/integrations/nango.server';
import { withProjectAccess } from '@/lib/middleware/common';
import {
  createServiceRoleSupabaseClient,
  getOrCreateRunningSyncQueueForSource,
} from '@/lib/supabase';
import { SyncData } from '@/types/types';

type Data = {
  status?: string;
  error?: string;
  data?: { connectionIds?: string[] };
};

const allowedMethods = ['POST'];

const supabase = createServiceRoleSupabaseClient();

const triggerSyncForSource = async (data: SyncData) => {
  if (!data.integrationId || !data.connectionId) {
    return;
  }

  const sourceId = await getSourceId(supabase, data.connectionId);

  if (!sourceId) {
    throw new Error('Source not found.');
  }

  await getOrCreateRunningSyncQueueForSource(supabase, sourceId);

  const nango = getNangoServerInstance();

  const syncStatuses = await nango.syncStatus(
    data.integrationId,
    [data.syncId],
    data.connectionId,
  );

  for (const sync of syncStatuses?.syncs || []) {
    // After a connection is made, its type is `INITIAL` and its sync state
    // is `PAUSED`. Calling `triggerSync` in this case leads to the sync
    // status to be `STOPPED` instead of `SUCCESS`. So we need to treat
    // this case differently and call `startSync` here.
    if (sync.type === 'INITIAL' && sync.status === 'PAUSED') {
      await nango.startSync(
        data.integrationId,
        [data.syncId],
        data.connectionId,
      );
      continue;
    }

    switch (sync.status) {
      case 'RUNNING':
        break;
      case 'ERROR':
      case 'STOPPED': {
        await nango.startSync(
          data.integrationId,
          [data.syncId],
          data.connectionId,
        );
        break;
      }
      case 'PAUSED':
      case 'SUCCESS': {
        await nango.triggerSync(
          data.integrationId,
          [data.syncId],
          data.connectionId,
        );
        break;
      }
    }
  }
};

export default withProjectAccess(
  allowedMethods,
  async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    if (req.method === 'POST') {
      const data = req.body.data as SyncData[];
      const errorConnectionIds: string[] = [];
      await Promise.all(
        data.map(async (d) => {
          try {
            await triggerSyncForSource(d);
          } catch {
            errorConnectionIds.push(d.connectionId);
          }
        }),
      );
      if (errorConnectionIds.length > 0) {
        return res.status(404).json({
          error: 'Error syncing connections',
          data: { connectionIds: errorConnectionIds },
        });
      }

      return res.status(200).json({ status: 'ok' });
    }

    return res.status(400).end();
  },
);
