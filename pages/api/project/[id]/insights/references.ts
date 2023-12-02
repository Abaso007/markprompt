import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import { isPresent } from 'ts-is-present';

import { withProjectAccess } from '@/lib/middleware/common';
import { createServiceRoleSupabaseClient } from '@/lib/supabase';
import { safeParseInt } from '@/lib/utils.nodeps';
import { Database } from '@/types/supabase';
import {
  NangoSourceDataType,
  Project,
  ReferenceWithOccurrenceCount,
} from '@/types/types';

type Data =
  | {
      status?: string;
      error?: string;
    }
  | ReferenceWithOccurrenceCount[];

const allowedMethods = ['GET'];

// Admin access to Supabase, bypassing RLS.
const supabaseAdmin = createServiceRoleSupabaseClient();

export default withProjectAccess(
  allowedMethods,
  async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    if (!req.method || !allowedMethods.includes(req.method)) {
      res.setHeader('Allow', allowedMethods);
      return res
        .status(405)
        .json({ error: `Method ${req.method} Not Allowed` });
    }

    const supabase = createServerSupabaseClient<Database>({ req, res });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const projectId = req.query.id as Project['id'];

    if (req.method === 'GET') {
      const limit = Math.min(safeParseInt(req.query.limit as string, 50), 50);
      const { data, error } = await supabaseAdmin.rpc(
        'query_stats_top_references',
        {
          project_id: projectId,
          from_tz: req.query.from as string,
          to_tz: req.query.to as string,
          match_count: limit,
        },
      );

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      if (!data) {
        return res.status(404).json({ error: 'No results found.' });
      }

      const { data: sources } = await supabaseAdmin
        .from('sources')
        .select('data->connectionId')
        .eq('project_id', projectId);

      const references = data
        .map((d) => {
          const source: {
            type: Database['public']['Enums']['source_type'];
            data: NangoSourceDataType;
          } = d.source as any;
          const sourceExists = sources?.some(
            (s) => s.connectionId === source.data.connectionId,
          );

          // Only include references to existing sources
          if (!sourceExists) {
            return undefined;
          }

          return {
            title: d.title,
            path: d.path,
            sourceType: source.type,
            sourceData: source.data,
            occurrences: d.occurrences,
          };
        })
        .filter(isPresent);

      return res.status(200).json(references);
    }

    return res.status(400).end();
  },
);
