import Markdoc, { RenderableTreeNode } from '@markdoc/markdoc';
import cn from 'classnames';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import Image from 'next/image';
import React, { FC, useMemo } from 'react';
import Balancer from 'react-wrap-balancer';

import { getMotifImageDimensionsFromUrl } from '@/lib/utils';

import { MarkdocContext } from './DocsLayout';
import LandingNavbar from './LandingNavbar';
import {
  Fence,
  MarkdocButton,
  ProseContainer,
  TOC,
  useTableOfContents,
} from './MarkdocLayout';
import { Collapse } from '../ui/Collapse';
import { CollapseGroup } from '../ui/CollapseGroup';
import { ContentImage } from '../ui/ContentImage';
import { Heading } from '../ui/Heading';
import { Note } from '../ui/Note';
import { Pattern } from '../ui/Pattern';
import { Video } from '../ui/Video';
import { YouTube } from '../ui/YouTube';

dayjs.extend(localizedFormat);

type BlogLayoutProps = {
  content: RenderableTreeNode;
  toc: TOC;
  frontmatter: any;
};

type CloudinaryImageProps = {
  src: string;
  alt: string;
  className?: string;
};

export const CloudinaryImage: FC<CloudinaryImageProps> = ({
  src,
  alt,
  className,
}) => {
  const dimens = useMemo(() => {
    if (!src) {
      return undefined;
    }
    return getMotifImageDimensionsFromUrl(src);
  }, [src]);

  if (!dimens) {
    return <></>;
  }

  return (
    <Image
      className={className}
      src={src}
      alt={alt}
      width={dimens.width}
      height={dimens.height}
    />
  );
};

export const AuthorList = ({
  authors,
  size = 'base',
  justify,
  highlight,
  linkTwitter,
  centerOnSm,
}: {
  authors: { name: string; avatar: string }[];
  size?: 'sm' | 'base';
  justify?: 'center';
  highlight?: boolean;
  linkTwitter?: boolean;
  centerOnSm?: boolean;
}) => {
  return (
    <div
      className={cn('flex flex-row flex-wrap', {
        'gap-4': size === 'sm',
        'gap-8': size === 'base',
        'justify-center gap-4 sm:justify-start': centerOnSm,
      })}
    >
      {authors?.map(
        (author: { name: string; avatar: string; twitter?: string }) => {
          const showTwitterHandle = linkTwitter && author?.twitter;
          return (
            <div className="not-prose group transition" key={author.name}>
              <a
                href={
                  showTwitterHandle
                    ? `https://twitter.com/${author.twitter}`
                    : undefined
                }
                target="_blank"
                rel="noreferrer"
                className={cn('not-prose flex flex-row items-center', {
                  'justify-center': justify === 'center',
                  'gap-2': size === 'sm',
                  'gap-4': size === 'base',
                })}
              >
                <CloudinaryImage
                  src={author.avatar}
                  alt={author.name || 'Avatar'}
                  className={cn('rounded-full object-cover', {
                    'h-6 w-6': size === 'sm',
                    'h-8 w-8': size === 'base',
                  })}
                />
                <div
                  className={cn(
                    'flex flex-col justify-center gap-0 whitespace-nowrap font-normal',
                    {
                      'text-sm': size === 'sm',
                      'text-neutral-400 group-hover:text-neutral-300':
                        !highlight,
                      'text-neutral-300': highlight,
                    },
                  )}
                >
                  <span
                    className={cn('leading-none', {
                      'font-medium': size === 'base',
                    })}
                  >
                    {author?.name}
                  </span>
                  {showTwitterHandle && (
                    <span className="text-sm text-neutral-600 group-hover:text-neutral-500">
                      @{author.twitter}
                    </span>
                  )}
                </div>
              </a>
            </div>
          );
        },
      )}
    </div>
  );
};

export const BlogLayout: FC<BlogLayoutProps> = ({
  content,
  toc,
  frontmatter,
}: any) => {
  const { registerHeading, unregisterHeading } = useTableOfContents(toc);

  return (
    <>
      <div className="relative mx-auto min-h-screen w-full">
        <Pattern />
        <MarkdocContext.Provider value={{ registerHeading, unregisterHeading }}>
          <div className="fixed top-0 left-0 right-0 z-30 h-24 bg-black/30 backdrop-blur">
            <div className="mx-auto max-w-screen-xl px-6 sm:px-8">
              <LandingNavbar noAnimation />
            </div>
          </div>
          <div className="prose prose-invert relative mx-auto min-h-screen w-full max-w-screen-xl px-6 pt-48 pb-24 sm:px-8">
            {frontmatter?.title && (
              <div className="flex justify-center">
                <h1 className="mb-4 text-center text-4xl md:text-5xl">
                  <Balancer>{frontmatter.title}</Balancer>
                </h1>
              </div>
            )}
            <div className="mt-4 mb-4 flex flex-row items-center  justify-center gap-4">
              {frontmatter?.authors && (
                <AuthorList
                  authors={frontmatter.authors}
                  justify="center"
                  linkTwitter
                  centerOnSm
                />
              )}
            </div>
            <div className="mb-8">
              <p className="mt-0 text-center text-neutral-500">
                {dayjs(frontmatter.date).format('LL')}
              </p>
            </div>
            {frontmatter?.cover && !frontmatter?.hideCover && (
              <CloudinaryImage
                src={frontmatter.cover}
                alt={frontmatter.title || 'Cover image'}
                className="w-full rounded-lg border border-neutral-900"
              />
            )}
            {frontmatter?.splashVideo && (
              <div className="mb-16">
                <Video
                  src={frontmatter?.splashVideo}
                  className="w-full rounded-lg border border-neutral-900"
                  autoPlay
                  loop
                  controls
                />
              </div>
            )}
            <div className="relative mx-auto w-full max-w-screen-md overflow-hidden">
              <ProseContainer>
                {Markdoc.renderers.react(content, React, {
                  components: {
                    Button: MarkdocButton,
                    Collapse,
                    CollapseGroup,
                    ContentImage,
                    Fence,
                    Heading,
                    Note,
                    Video,
                    YouTube,
                  },
                })}
              </ProseContainer>
            </div>
          </div>
        </MarkdocContext.Provider>
      </div>
    </>
  );
};
