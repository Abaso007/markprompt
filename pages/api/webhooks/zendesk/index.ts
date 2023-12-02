import type { NextApiRequest, NextApiResponse } from 'next';

type Data =
  | {
      status?: string;
      error?: string;
    }
  | { content: string };

const allowedMethods = ['POST'];

// This webhook is called whenever Nango finishes a sync. It sends a message
// to Inngest for indexing the new Nango data. It also pauses the sync unless
// the tier has auto-sync available.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (!req.method || !allowedMethods.includes(req.method)) {
    res.setHeader('Allow', allowedMethods);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  console.debug('[ZENDEK] Webhook called', JSON.stringify(req.body));

  return res.status(200).json({});
}
