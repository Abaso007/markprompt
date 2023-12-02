import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

import { withProjectAccess } from '@/lib/middleware/common';
import { Database } from '@/types/supabase';

type Data = {
  exists?: boolean;
  error?: string;
};

const allowedMethods = ['POST'];

export default withProjectAccess(
  allowedMethods,
  async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    if (req.method === 'POST') {
      if (!req.body.identifier) {
        return res.status(400).json({ error: 'No identifier provided.' });
      }

      const supabase = createServerSupabaseClient<Database>({ req, res });

      const { data } = await supabase
        .from('sources')
        .select('id')
        .eq('project_id', req.query.id!)
        .eq('type', 'nango')
        .eq('data->identifier', req.body.identifier!);

      return res.status(200).json({ exists: !!data });
    }

    return res.status(400).end();
  },
);
