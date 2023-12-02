import type { NextApiRequest, NextApiResponse } from 'next';

import { getSourceSyncData } from '@/lib/integrations/nango.server';
import {
  createServiceRoleSupabaseClient,
  getOrCreateRunningSyncQueueForSource,
} from '@/lib/supabase';
import { getAuthorizationToken } from '@/lib/utils';

type Data =
  | {
      status?: string;
      error?: string;
    }
  | { syncQueueId: string };

const allowedMethods = ['GET'];

// Need to use service role Supabase client here as the request is
// coming from the Nango sync service.
const supabase = createServiceRoleSupabaseClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (!req.method || !allowedMethods.includes(req.method)) {
    res.setHeader('Allow', allowedMethods);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const token = getAuthorizationToken(req.headers.authorization);

  if (token !== process.env.MARKPROMPT_API_TOKEN) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const connectionId = req.query.connectionId as string;

  const sourceSyncData = await getSourceSyncData(supabase, connectionId);

  if (!sourceSyncData) {
    return res.status(400).json({ status: 'Sync data not accessible' });
  }

  const syncQueueId = await getOrCreateRunningSyncQueueForSource(
    supabase,
    sourceSyncData.id,
  );

  if (!syncQueueId) {
    return res.status(400).json({ status: 'Sync queue not accessible' });
  }

  return res.status(200).json({ syncQueueId });
}
