import type { NextApiRequest, NextApiResponse } from 'next';

import { withProjectAccess } from '@/lib/middleware/common';
import { createServiceRoleSupabaseClient } from '@/lib/supabase';
import { DbSource, DbSyncQueueOverview } from '@/types/types';

type Data =
  | {
      status?: string;
      error?: string;
    }
  | DbSyncQueueOverview[];

const allowedMethods = ['GET'];

// Admin access to Supabase, bypassing RLS.
const supabase = createServiceRoleSupabaseClient();

export default withProjectAccess(
  allowedMethods,
  async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    if (req.method !== 'GET') {
      return res.status(400).end();
    }

    const sourceId = req.query.sourceId as DbSource['id'];
    const page = (req.query.page || 0) as number;
    const limit = (req.query.limit || 20) as number;

    const { data } = await supabase
      .from('sync_queues')
      .select('id,source_id,created_at,ended_at,status')
      .eq('source_id', sourceId)
      .order('created_at', { ascending: false })
      .range(page * limit, page * limit + limit)
      .limit(limit);

    return res.status(200).json(data || []);
  },
);
