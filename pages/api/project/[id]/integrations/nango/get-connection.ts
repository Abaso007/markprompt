import { Connection } from '@nangohq/node/dist/types';
import type { NextApiRequest, NextApiResponse } from 'next';

import { getNangoServerInstance } from '@/lib/integrations/nango.server';
import { withProjectAccess } from '@/lib/middleware/common';

type Data =
  | {
      status?: string;
      error?: string;
    }
  | { connection: Connection };

const allowedMethods = ['GET'];

export default withProjectAccess(
  allowedMethods,
  async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    try {
      if (req.method === 'GET') {
        if (!req.query.integrationId) {
          return res.status(400).json({ error: 'No integration id provided.' });
        } else if (!req.query.connectionId) {
          return res.status(400).json({ error: 'No connection id provided.' });
        }

        const nango = getNangoServerInstance();

        const connection = await nango.getConnection(
          req.query.integrationId as string,
          req.query.connectionId as string,
        );

        return res.status(200).json({ connection });
      }
    } catch (e) {
      console.error(
        '[CONNECTION] Error getting connection:',
        (e as any).response?.data?.error,
      );
      // Do nothing
    }

    return res.status(400).json({ error: 'Connection not found.' });
  },
);
