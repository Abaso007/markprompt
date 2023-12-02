import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { FC } from 'react';

import { LandingLayout } from '@/components/layouts/LandingLayout';
import { Agents } from '@/components/pages/sections/home/Agents';
import { Companies } from '@/components/pages/sections/home/Companies';
import { Developers } from '@/components/pages/sections/home/Developers';
import { ExpertKnowledge } from '@/components/pages/sections/home/ExpertKnowledge';
import { Hero } from '@/components/pages/sections/home/Hero';
import { Integrations } from '@/components/pages/sections/home/Integrations';
import { Ready } from '@/components/pages/sections/home/Ready';
import { getIndexPageStaticProps } from '@/lib/pages';

export const getStaticProps: GetStaticProps = getIndexPageStaticProps;

const Home: FC<InferGetStaticPropsType<typeof getStaticProps>> = () => {
  return (
    <>
      <Hero />
      <div className="h-20 md:h-32" />
      <Companies />
      <div className="h-20 md:h-32" />
      <Agents />
      <div className="h-20 md:h-40" />
      <ExpertKnowledge />
      <div className="h-20 md:h-40" />
      <Integrations />
      <div className="h-20 md:h-40" />
      <Developers />
      <div className="h-20 md:h-40" />
      <Ready />
    </>
  );
};

const HomeWithLayout: FC<
  InferGetStaticPropsType<typeof getIndexPageStaticProps>
> = ({ stars, status }) => {
  return (
    <LandingLayout
      pageTitle="Markprompt | AI for customer support"
      stars={stars}
      status={status}
      exludePostfixFromTitle
      animateNavbar
      noDots
    >
      <Home />
    </LandingLayout>
  );
};

export default HomeWithLayout;
