import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

import { withProjectAccess } from '@/lib/middleware/common';
import { Database } from '@/types/supabase';
import { Domain, Project } from '@/types/types';

type Data =
  | {
      status?: string;
      error?: string;
    }
  | Domain[]
  | Domain;

const allowedMethods = ['GET', 'POST', 'DELETE'];

export default withProjectAccess(
  allowedMethods,
  async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const supabase = createServerSupabaseClient<Database>({ req, res });

    const projectId = req.query.id as Project['id'];

    if (req.method === 'GET') {
      const { data: domains, error } = await supabase
        .from('domains')
        .select('*')
        .eq('project_id', projectId);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      if (!domains) {
        return res.status(404).json({ error: 'No domains found.' });
      }

      return res.status(200).json(domains);
    } else if (req.method === 'POST') {
      if (!req.body.name) {
        return res.status(400).json({ error: 'No domain provided.' });
      }

      const { error, data } = await supabase
        .from('domains')
        .insert([{ project_id: projectId, name: req.body.name as string }])
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('[DOMAINS]', error.message);
        throw error;
      }

      if (!data) {
        console.error(
          '[DOMAINS] No data returned when adding domain',
          projectId,
          req.body.name,
        );
        return res.status(400).json({ error: 'Error adding domain.' });
      }

      return res.status(200).json(data);
    } else if (req.method === 'DELETE') {
      const { error } = await supabase
        .from('domains')
        .delete()
        .eq('id', req.body.id);
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      res.status(200).end();
    }

    return res.status(400).end();
  },
);
