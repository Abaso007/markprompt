import { NextApiRequest, NextApiResponse } from 'next';

// import { createServiceRoleSupabaseClient } from '@/lib/supabase';

// Admin access to Supabase, bypassing RLS.
// const supabaseAdmin = createServiceRoleSupabaseClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).json({ status: 'Application was not authorized.' });
  }

  // const accessTokenRes = await fetch('https://github.com/login/oauth/token', {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     client_id: process.env.NEXT_PUBLIC_GITHUB_APP_CLIENT_ID,
  //     client_secret: process.env.GITHUB_APP_CLIENT_SECRET,
  //     code,
  //   }),
  //   headers: {
  //     'Content-Type': 'application/json',
  //     accept: 'application/json',
  //   },
  // });

  // if (!accessTokenRes.ok) {
  //   console.error('Error getting OAuth token');
  //   return res
  //     .status(accessTokenRes.status)
  //     .json({ status: await accessTokenRes.text() });
  // }

  // const accessTokenInfo = await accessTokenRes.json();

  // if (accessTokenInfo.error_description) {
  //   return res.status(400).json({ status: accessTokenInfo.error_description });
  // }

  return res.status(200).json({ status: 'ok' });
}
