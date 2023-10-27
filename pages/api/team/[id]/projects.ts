import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SupabaseClient } from '@supabase/auth-helpers-react';
import type { NextApiRequest, NextApiResponse } from 'next';

import { withTeamAdminAccess } from '@/lib/middleware/common';
import {
  generatePKKey,
  generateRandomSlug,
  generateSKTestKey,
  slugFromNameOrRandom,
} from '@/lib/utils';
import { Database } from '@/types/supabase';
import { Project, DbTeam } from '@/types/types';

import { isProjectSlugAvailable } from '../../slug/is-project-slug-available';

const getAvailableProjectSlug = async (
  supabase: SupabaseClient<Database>,
  teamId: DbTeam['id'],
  name: Project['name'],
) => {
  let baseSlug: string | undefined = undefined;
  if (name && name.length > 0) {
    baseSlug = slugFromNameOrRandom(name);
  } else {
    baseSlug = generateRandomSlug();
  }

  let candidateSlug = baseSlug;
  let isAvailable = await isProjectSlugAvailable(
    supabase,
    teamId,
    candidateSlug,
  );

  let attempt = 0;
  while (!isAvailable) {
    isAvailable = await isProjectSlugAvailable(supabase, teamId, candidateSlug);
    attempt++;
    candidateSlug = `${baseSlug}-${attempt}`;
  }

  return candidateSlug;
};

type Data =
  | {
      status?: string;
      error?: string;
    }
  | Project[]
  | Project;

const allowedMethods = ['GET', 'POST'];

export default withTeamAdminAccess(
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

    const teamId = req.query.id as DbTeam['id'];

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .match({ team_id: teamId });

      if (error) {
        console.error('api/team/[]/projects:', error);
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json(data || []);
    } else if (req.method === 'POST') {
      const { name } = req.body;
      const slug = await getAvailableProjectSlug(supabase, teamId, name);
      const public_api_key = generatePKKey();
      const private_dev_api_key = generateSKTestKey();
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            name,
            team_id: teamId,
            slug,
            created_by: session.user.id,
            public_api_key,
            private_dev_api_key,
          },
        ])
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('api/team/[]/projects', error);
        return res.status(400).json({ error: error.message });
      }

      if (!data) {
        console.error('api/team/[]/projects: no data');
        return res.status(400).json({ error: 'Unable to create project' });
      }

      return res.status(200).json(data);
    }

    return res.status(200).json({ status: 'ok' });
  },
);
