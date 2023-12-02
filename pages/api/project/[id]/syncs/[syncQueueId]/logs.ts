import type { NextApiRequest, NextApiResponse } from 'next';

import { withProjectAccess } from '@/lib/middleware/common';
import { createServiceRoleSupabaseClient } from '@/lib/supabase';
import { DbSyncQueue, DbSyncQueueLog } from '@/types/types';

type Data =
  | {
      status?: string;
      error?: string;
    }
  | DbSyncQueueLog[];

const allowedMethods = ['GET'];

// Admin access to Supabase, bypassing RLS.
const supabase = createServiceRoleSupabaseClient();

export default withProjectAccess(
  allowedMethods,
  async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    if (req.method !== 'GET') {
      return res.status(400).end();
    }

    const syncQueueId = req.query.syncQueueId as DbSyncQueue['id'];

    const { data } = await supabase
      .from('sync_queues')
      .select('logs')
      .eq('id', syncQueueId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      return res.status(200).json(data.logs as DbSyncQueueLog[]);
    }

    return res.status(400).json({ error: 'Logs not found' });
  },
);
