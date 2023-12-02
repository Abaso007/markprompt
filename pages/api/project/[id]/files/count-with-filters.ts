import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { PostgrestError } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

import { withProjectAccess } from '@/lib/middleware/common';
import { safeParseJSON } from '@/lib/utils.nodeps';
import { Database } from '@/types/supabase';
import { Project } from '@/types/types';

type Data =
  | {
      status?: string;
      error?: string;
    }
  | { count: number };

const allowedMethods = ['GET'];

export default withProjectAccess(
  allowedMethods,
  async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const supabase = createServerSupabaseClient<Database>({ req, res });

    const projectId = req.query.id as Project['id'];

    if (req.method === 'GET') {
      const sourceIdsFilter: string[] = safeParseJSON(
        req.query.sourceIdsFilter as string,
        [],
      );

      let error: PostgrestError | null = null;
      let count: number | null = null;

      if (!sourceIdsFilter || sourceIdsFilter.length === 0) {
        const { count: _count, error: _error } = await supabase
          .from('files')
          .select(
            'id,path,meta,project_id,updated_at,source_id,checksum,token_count,internal_metadata, sources!inner (project_id)',
            {
              count: 'exact',
              head: true,
            },
          )
          .eq('sources.project_id', projectId);
        count = _count;
        error = _error;
      } else {
        const { count: _count, error: _error } = await supabase
          .from('files')
          .select(
            'id,path,meta,project_id,updated_at,source_id,checksum,token_count,internal_metadata, sources!inner (id,project_id)',
            {
              count: 'exact',
              head: true,
            },
          )
          .eq('sources.project_id', projectId)
          .in('sources.id', sourceIdsFilter);
        count = _count;
        error = _error;
      }

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ count: count || 0 });
    }

    return res.status(400).end();
  },
);
