import type { NextApiRequest, NextApiResponse } from 'next';

import { shouldPauseSync } from '@/lib/integrations/nango.server';
import { withProjectAccess } from '@/lib/middleware/common';
import { createServiceRoleSupabaseClient } from '@/lib/supabase';
import { inngest, NangoSyncPayload } from '@/pages/api/inngest';
import { SyncData } from '@/types/types';

type Data = {
  status?: string;
  error?: string;
  data?: { connectionId?: string };
};

const allowedMethods = ['POST'];

// Currently, stop syncing is treated as deleting the connection.
export default withProjectAccess(
  allowedMethods,
  async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    if (req.method === 'POST') {
      const data = req.body.data as SyncData;
      const nangoSyncPayload: NangoSyncPayload = {
        providerConfigKey: data.integrationId,
        connectionId: data.connectionId,
        model: 'NangoFile',
        queryTimeStamp: null,
      };

      const supabase = createServiceRoleSupabaseClient();

      // If this is a non-enterprise project, pause the sync
      const shouldPause = await shouldPauseSync(supabase, nangoSyncPayload);

      await inngest.send({
        name: 'nango/sync',
        data: { nangoSyncPayload, shouldPause },
      });

      return res.status(200).json({ status: 'ok' });
    }

    return res.status(400).end();
  },
);
