import Head from 'next/head';
import { FC } from 'react';

type WebsiteSection = 'website' | 'blog' | 'docs';

type SharedHeadProps = {
  title: string;
  description?: string;
  section?: WebsiteSection;
  ogImage?: string;
  exludePostfixFromTitle?: boolean;
};

const sectionTitle = (section: WebsiteSection) => {
  switch (section) {
    case 'blog':
      return 'Markprompt Blog';
    case 'docs':
      return 'Markprompt Docs';
    case 'website':
      return 'Markprompt';
  }
};

export const SharedHead: FC<SharedHeadProps> = ({
  title,
  description,
  section,
  ogImage,
  exludePostfixFromTitle,
}) => {
  const _ogImage = ogImage ?? 'https://markprompt.com/static/cover.png';
  const _description = description ?? 'AI for customer support';
  return (
    <Head>
      <title>
        {`${title}${
          exludePostfixFromTitle
            ? ''
            : ` | ${sectionTitle(section ?? 'website')}`
        }`}
      </title>
      <meta property="og:title" content={title} />
      <meta name="description" content={_description} key="desc" />
      <meta property="og:description" content={_description} />

      <meta property="og:url" content="https://markprompt.com/" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:image" content={_ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:domain" content="markprompt.com" />
      <meta property="twitter:url" content="https://markprompt.com/" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={_description} />
      <meta name="twitter:image" content={_ogImage} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
  );
};
