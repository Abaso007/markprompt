import { Nango } from '@nangohq/node';
import type { NextApiRequest, NextApiResponse } from 'next';

import { withProjectAccess } from '@/lib/middleware/common';

type Data = {
  status?: string;
  error?: string;
};

const allowedMethods = ['POST'];

const nango = new Nango({
  secretKey:
    process.env.NODE_ENV === 'production'
      ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        process.env.NANGO_SECRET_KEY_PROD!
      : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        process.env.NANGO_SECRET_KEY_DEV!,
});

export default withProjectAccess(
  allowedMethods,
  async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    if (req.method === 'POST') {
      if (!req.body.integrationId) {
        return res.status(400).json({ error: 'No integration id provided.' });
      } else if (!req.body.connectionId) {
        return res.status(400).json({ error: 'No connection id provided.' });
      }

      const metadata = await nango.getMetadata<Metadata>();

      console.log(
        'ID',
        req.body.integrationId,
        req.body.connectionId,
        req.body.syncIds,
      );
      try {
        await nango.triggerSync(
          req.body.integrationId,
          req.body.connectionId,
          req.body.syncIds,
        );
      } catch (e) {
        console.log('Error trigger sync', e);
      }

      console.log('ALL good');
      return res.status(200).json({});
    }

    return res.status(400).end();
  },
);
