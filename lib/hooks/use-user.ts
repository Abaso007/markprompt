import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import Router from 'next/router';
import { useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import useSWR, { useSWRConfig } from 'swr';

import { DbUser } from '@/types/types';

import { fetcher } from '../utils';

const superAdmins = JSON.parse(process.env.NEXT_PUBLIC_SUPERADMINS || '[]');

export default function useUser() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { mutate } = useSWRConfig();
  const {
    data: user,
    mutate: mutateUser,
    error,
  } = useSWR(session?.user ? '/api/user' : null, fetcher<DbUser>);

  const loading = session?.user ? !user && !error : false;
  const loggedOut = error && error.status === 403;

  const signOut = useCallback(async () => {
    if (!supabase?.auth) {
      Router.push('/');
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`Error signing out: ${error.message}`);
      return;
    }

    await mutate('/api/user');
    setTimeout(() => {
      Router.push('/');
    }, 500);
  }, [supabase.auth, mutate]);

  useEffect(() => {
    if (
      session &&
      error?.status === 403 &&
      error?.info?.status === 'InvalidSignature'
    ) {
      // When a JWT token is regenerated in Supabase, users will
      // have a valid session, but the associated token will
      // not be valid for making requests to Supabase, so we need
      // to log them out first. This situation is handled on the
      // server by sending a 403 error with an `InvalidSignature`
      // status.
      signOut();
      // Prevent multiple calls to the toast.
      toast.success('Please sign in again.', { id: 'jwt_auto_signout' });
    }
  }, [error, signOut, session]);

  const isSuperAdmin = useMemo(() => {
    if (!user?.email) {
      return false;
    }
    return superAdmins.includes(user.email);
  }, [user?.email]);

  return {
    loading,
    loggedOut,
    user,
    isSuperAdmin,
    mutate: mutateUser,
    signOut,
  };
}
