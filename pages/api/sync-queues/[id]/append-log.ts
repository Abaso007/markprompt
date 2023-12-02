import type { NextApiRequest, NextApiResponse } from 'next';

import { getSourceSyncData } from '@/lib/integrations/nango.server';
import {
  appendLogToSyncQueue,
  createServiceRoleSupabaseClient,
  getOrCreateRunningSyncQueueForSource,
} from '@/lib/supabase';
import { getAuthorizationToken } from '@/lib/utils';

type Data = {
  status?: string;
  error?: string;
};

const allowedMethods = ['POST'];

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

  const syncQueueId = req.query.id as string;

  if (!syncQueueId || !req.body.message || !req.body.level) {
    return res.status(400).json({
      status: 'Invalid request: please provide a message and a level.',
    });
  }

  await appendLogToSyncQueue(
    supabase,
    syncQueueId,
    req.body.message,
    req.body.level,
  );

  return res.status(200).json({ status: 'ok' });
}
