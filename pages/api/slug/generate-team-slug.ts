import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SupabaseClient } from '@supabase/auth-helpers-react';
import type { NextApiRequest, NextApiResponse } from 'next';

import { MIN_SLUG_LENGTH } from '@/lib/constants';
import { createServiceRoleSupabaseClient } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type Data =
  | {
      status?: string;
      error?: string;
    }
  | string;

const allowedMethods = ['POST'];

const RESERVED_TEAM_SLUGS = [
  'about',
  'account',
  'api',
  'app',
  'blog',
  'customers',
  'docs',
  'emails',
  'embed',
  'integrations',
  'legal',
  'login',
  'pricing',
  'resources',
  's',
  'settings',
  'templates',
];

export const isTeamSlugAvailable = async (
  supabaseWithServiceRole: SupabaseClient<Database>,
  slug: string,
) => {
  if (
    !slug ||
    slug.trim().length < MIN_SLUG_LENGTH ||
    RESERVED_TEAM_SLUGS.includes(slug)
  ) {
    return false;
  }

  const { count } = await supabaseWithServiceRole
    .from('teams')
    .select('slug', { count: 'exact' })
    .eq('slug', slug);

  return count === 0;
};

export const getAvailableTeamSlug = async (
  supabaseWithServiceRole: SupabaseClient<Database>,
  baseSlug: string,
) => {
  let candidateSlug = baseSlug;
  let attempt = 0;
  let isAvailable = await isTeamSlugAvailable(
    supabaseWithServiceRole,
    candidateSlug,
  );
  while (!isAvailable) {
    attempt++;
    candidateSlug = `${baseSlug}-${attempt}`;
    isAvailable = await isTeamSlugAvailable(
      supabaseWithServiceRole,
      candidateSlug,
    );
  }
  return candidateSlug;
};

// Admin access to Supabase, bypassing RLS.
const supabaseAdmin = createServiceRoleSupabaseClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (!req.method || !allowedMethods.includes(req.method)) {
    res.setHeader('Allow', allowedMethods);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const supabase = createServerSupabaseClient<Database>({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const candidate = req.body.candidate;
  const slug = await getAvailableTeamSlug(supabaseAdmin, candidate);

  return res.status(200).json(slug);
}
