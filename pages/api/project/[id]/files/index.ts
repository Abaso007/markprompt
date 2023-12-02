import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

import { withProjectAccess } from '@/lib/middleware/common';
import { safeParseInt, safeParseJSON } from '@/lib/utils.nodeps';
import { Database } from '@/types/supabase';
import { DbFileWithoutContent, Project } from '@/types/types';

type Data =
  | {
      status?: string;
      error?: string;
    }
  | DbFileWithoutContent[];

const allowedMethods = ['GET', 'DELETE'];

const getTableSortColumnId = (sortingId: string): 'updated_at' | 'title' => {
  switch (sortingId) {
    case 'name':
      return 'title';
    default:
      return 'updated_at';
  }
};

export default withProjectAccess(
  allowedMethods,
  async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const supabase = createServerSupabaseClient<Database>({ req, res });

    const projectId = req.query.id as Project['id'];

    if (req.method === 'GET') {
      // Note: if a column is a reference to another table, e.g.
      // project_id, and the value is null, somehow the following
      // join with filter does not include these rows. This looks
      // like a bug in Supabase.
      const limit = Math.max(
        1,
        Math.min(safeParseInt(req.query.limit as string, 50), 50),
      );
      const page = safeParseInt(req.query.page as string, 0);
      const sorting = safeParseJSON(req.query.sorting as string, {
        id: 'updated',
        desc: true,
      });

      const sourceIdsFilter: string[] = safeParseJSON(
        req.query.sourceIdsFilter as string,
        [],
      );

      const startOffset = page * limit;

      const { data: files, error } = await supabase.rpc('get_files', {
        q_project_id: projectId,
        q_order_by_column: getTableSortColumnId(sorting.id),
        q_order_by_direction: sorting.desc ? 'desc' : 'asc',
        q_limit: limit,
        q_offset: startOffset,
        q_source_ids: sourceIdsFilter,
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      if (!files) {
        return res.status(404).json({ error: 'No files found' });
      }

      // Matierialized views turn columns into `col_type | null` types
      // instead of the actual `col_type` type, so we type cast here
      // to stay with the actual types.
      return res.status(200).json(files);
    } else if (req.method === 'DELETE') {
      const ids = req.body;
      if (!ids) {
        return res.status(400).json({
          error: 'Invalid request. Please provide a list of ids to delete.',
        });
      }

      const { error } = await supabase
        .from('files')
        .delete()
        .in('id', ids)
        .select('path');

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ status: 'ok' });
    }

    return res.status(400).end();
  },
);
