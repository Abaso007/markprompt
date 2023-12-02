import { useSession } from '@supabase/auth-helpers-react';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { FC, memo } from 'react';

import AppPage from '@/components/pages/App';
import { getIndexPageStaticProps } from '@/lib/pages';

import Home from './home';

export interface RawDomainStats {
  timestamp: number;
}

export const getStaticProps: GetStaticProps = getIndexPageStaticProps;

const Index: FC<InferGetStaticPropsType<typeof getIndexPageStaticProps>> = ({
  stars,
  status,
}) => {
  const session = useSession();

  if (!session) {
    return <Home stars={stars} status={status} />;
  } else {
    return <AppPage />;
  }
};

export default memo(Index);
