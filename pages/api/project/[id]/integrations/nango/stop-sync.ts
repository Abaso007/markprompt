import type { NextApiRequest, NextApiResponse } from 'next';

import {
  getNangoServerInstance,
  getSourceId,
  getSourceSyncData,
} from '@/lib/integrations/nango.server';
import { withProjectAccess } from '@/lib/middleware/common';
import {
  createServiceRoleSupabaseClient,
  getOrCreateRunningSyncQueueForSource,
  updateSyncQueueStatus,
} from '@/lib/supabase';
import { SyncData } from '@/types/types';

type Data = {
  status?: string;
  error?: string;
  data?: { connectionId?: string };
};

const allowedMethods = ['POST'];

const supabase = createServiceRoleSupabaseClient();

const pauseSyncForSource = async (data: SyncData) => {
  if (!data.integrationId || !data.connectionId) {
    return;
  }

  const sourceId = await getSourceId(supabase, data.connectionId);

  if (!sourceId) {
    throw new Error('Source not found.');
  }

  const sourceSyncData = await getSourceSyncData(supabase, data.connectionId);

  if (!sourceSyncData) {
    return;
  }

  const syncQueueId = await getOrCreateRunningSyncQueueForSource(
    supabase,
    sourceSyncData.id,
  );

  await updateSyncQueueStatus(supabase, syncQueueId, 'canceled');

  try {
    const nango = getNangoServerInstance();

    await nango.deleteConnection(data.integrationId, data.connectionId);
  } catch (e) {
    // Do nothing
    console.error('[STOP SYNC]', e);
  }
};

// Currently, stop syncing is treated as deleting the connection.
export default withProjectAccess(
  allowedMethods,
  async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    if (req.method === 'POST') {
      const data = req.body.data as SyncData;
      try {
        await pauseSyncForSource(data);
      } catch {
        return res.status(404).json({
          error: 'Error stopping syncs',
          data: { connectionId: data.connectionId },
        });
      }

      return res.status(200).json({ status: 'ok' });
    }

    return res.status(400).end();
  },
);
