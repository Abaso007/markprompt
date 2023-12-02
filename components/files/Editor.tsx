import { FileReferenceFileData } from '@markprompt/core';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import cn from 'classnames';
import { parseISO } from 'date-fns';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import matter from 'gray-matter';
import { Check, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Language } from 'prism-react-renderer';
import { FC, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

import { getFileIdBySourceAndPath } from '@/lib/api';
import { formatShortDateTimeInTimeZone } from '@/lib/date';
import useProject from '@/lib/hooks/use-project';
import useSources from '@/lib/hooks/use-sources';
import { useLocalStorage } from '@/lib/hooks/utils/use-localstorage';
import { convertToMarkdown } from '@/lib/markdown';
import {
  fetcher,
  getDisplayPathForPath,
  getFileType,
  getFullURLForPath,
  getIconForSource,
  getLabelForSource,
  getURLForSource,
} from '@/lib/utils';
import { getFileNameForSourceAtPath } from '@/lib/utils.nodeps';
import { getFileTitle } from '@/lib/utils.non-edge';
import { DbFile } from '@/types/types';

import { MarkdownContainer } from '../emails/templates/MarkdownContainer';
import { CodePanel } from '../ui/CodePanel';
import { SkeletonTable } from '../ui/Skeletons';

dayjs.extend(localizedFormat);

// The editor can take either a file id, or reference data (e.g. from
// the conversation query stats). The reason we accept both there, and
// not rely e.g. on the called to fetch the file id first, is that we
// want the editor to show up immediately when clicking a reference.
type EditorProps = {
  fileId?: DbFile['id'];
  fileReferenceData?: FileReferenceFileData;
  highlightSectionSlug?: string;
};

type EditorView = 'preview' | 'markdown' | 'source';

const viewToDisplayName = (view: EditorView) => {
  switch (view) {
    case 'preview':
      return 'Preview';
    case 'markdown':
      return 'Markdown';
    case 'source':
      return 'Source';
  }
};

const toLanguage = (file: DbFile): Language => {
  const contentType = (file.internal_metadata as any)?.contentType;
  switch (contentType) {
    case 'html':
      return 'markup';
    default:
      return 'markdown';
  }
};

export const Editor: FC<EditorProps> = ({
  fileId: _fileId,
  fileReferenceData,
}) => {
  const { project } = useProject();
  const { sources } = useSources();
  const [fileId, setFileId] = useState(_fileId);
  const [view, setView] = useLocalStorage<EditorView>('editor:view', 'preview');
  const [loadingFileId, setLoadingFileId] = useState(false);
  const [fileIdError, setFileIdError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!project?.id || _fileId || !fileReferenceData) {
      return;
    }

    (async () => {
      setLoadingFileId(true);
      try {
        setFileIdError(undefined);
        const fileId = await getFileIdBySourceAndPath(
          project?.id,
          fileReferenceData.source,
          fileReferenceData.path,
        );
        if (fileId) {
          setFileId(fileId);
        }
      } catch (e) {
        setFileIdError(`${e}`);
      }
      setLoadingFileId(false);
    })();
  }, [project?.id, _fileId, fileReferenceData]);

  const { data: file, error: fileError } = useSWR(
    project?.id && fileId ? `/api/project/${project.id}/files/${fileId}` : null,
    fetcher<DbFile>,
  );

  const loading = (!file && !fileError && !fileIdError) || loadingFileId;

  const source = useMemo(() => {
    return sources?.find((s) => s.id === file?.source_id);
  }, [sources, file?.source_id]);

  const SourceItem = useMemo(() => {
    if (!source) {
      return <></>;
    }
    const Icon = getIconForSource(source);
    const label = getLabelForSource(source, false);
    const url = getURLForSource(source);

    return (
      <div className="flex flex-row items-center gap-2">
        <Icon className="h-4 w-4 flex-none text-neutral-500" />
        <div className="flex-grow overflow-hidden truncate text-neutral-300">
          {url ? (
            <Link
              href={url}
              className="subtle-underline"
              target="_blank"
              rel="noreferrer"
            >
              {label}
            </Link>
          ) : (
            <p>{label}</p>
          )}
        </div>
      </div>
    );
  }, [source]);

  const markdownContent = useMemo(() => {
    const markdown = file?.processed_markdown ?? file?.raw_content;
    if (!markdown || !source || !file?.path) {
      return '';
    }

    // TODO: remove this in the future. This is for backward
    // compatibility for sources that have not yet been synced with
    // the new system. In the new system, processed_markdown gets the value
    // of the processed Markdown. In the old system, the raw value of
    // the content is stored, e.g. raw HTML.
    const insertedAt = new Date(source.inserted_at);
    const newSyncArchitectureReleaseDate = new Date('2023-11-12');
    if (insertedAt.getTime() < newSyncArchitectureReleaseDate.getTime()) {
      const filename = getFileNameForSourceAtPath(source, file.path);
      const fileType =
        (file.internal_metadata as any)?.contentType ?? getFileType(filename);
      const m = matter(markdown);
      return convertToMarkdown(
        m.content.trim(),
        fileType,
        undefined,
        undefined,
        undefined,
      );
    }

    const m = matter(markdown);
    return m.content.trim();
  }, [
    file?.internal_metadata,
    file?.path,
    file?.raw_content,
    file?.processed_markdown,
    source,
  ]);

  const computedView = useMemo(() => {
    // For backwards compatibility, where processed_markdown is not present,
    // show the preview.
    if (!file?.processed_markdown && view === 'markdown') {
      return 'preview';
    }
    return view;
  }, [view, file?.processed_markdown]);

  if (loading) {
    return (
      <div className="w-full p-4">
        <div className="relative">
          <SkeletonTable loading />;
        </div>
      </div>
    );
  }

  if (!file || !source) {
    return (
      <div className="p-4 text-sm text-neutral-300">
        The file is not accessible. Please sync your data again, and if the
        problem persists,{' '}
        <a
          className="subtle-underline"
          href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}
        >
          contact support
        </a>
        .
      </div>
    );
  }

  const displayPath = getDisplayPathForPath(source, file.path);
  const pathUrl = getFullURLForPath(source, file.path);

  return (
    <div className="mx-auto flex max-w-screen-md flex-col gap-2">
      <h1 className="mt-12 text-3xl font-bold text-neutral-100">
        {getFileTitle(file, sources)}
      </h1>
      <div className="mt-8 grid grid-cols-3 gap-4 border-b border-neutral-900 pb-4">
        <div className="text-sm text-neutral-500">Synced</div>
        <div className="text-sm text-neutral-500">Source</div>
        <div className="text-sm text-neutral-500">Path</div>
        <div className="text-sm text-neutral-300">
          {formatShortDateTimeInTimeZone(parseISO(file.updated_at))}
        </div>
        <div className="overflow-hidden truncate whitespace-nowrap text-sm text-neutral-300">
          {SourceItem}
        </div>
        <div className="overflow-hidden truncate whitespace-nowrap text-sm text-neutral-300">
          {pathUrl ? (
            <Link
              href={pathUrl}
              target="_blank"
              rel="noreferrer"
              className="subtle-underline"
            >
              {displayPath}
            </Link>
          ) : (
            <>{displayPath}</>
          )}
        </div>
      </div>
      {/*
      {supportsFrontmatter(getFileType(filename)) &&
        file?.meta &&
        Object.keys(file.meta).length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-2 overflow-hidden border-b border-neutral-900 pb-4 sm:grid-cols-4">
            {Object.keys(file.meta).map((k) => {
              const value = (file.meta as any)[k];
              let comp = undefined;
              if (typeof value === 'string') {
                comp = value;
              } else {
                comp = JSON.stringify(value);
              }
              return (
                <Fragment key={`meta-${k}`}>
                  <p className="text-sm text-neutral-500">{k}</p>
                  <p className="text-sm text-neutral-300 sm:col-span-3">
                    {comp}
                  </p>
                </Fragment>
              );
            })}
          </div>
        )} */}
      <div className="flex flex-row items-center justify-end gap-4">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <div className="flex flex-row items-center gap-1">
              <span className="text-xs text-neutral-500">View as:</span>
              <button
                className={cn(
                  'flex flex-none select-none flex-row items-center gap-1 rounded-md py-1.5 px-1.5 text-xs text-neutral-500 outline-none transition hover:bg-neutral-900 hover:text-neutral-400',
                )}
                aria-label="View"
                onClick={(e) => e.stopPropagation()}
              >
                {viewToDisplayName(computedView || 'preview')}
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="animate-menu-up dropdown-menu-content min-w-[160px]"
              sideOffset={5}
            >
              <DropdownMenu.CheckboxItem
                className="dropdown-menu-item dropdown-menu-item-indent"
                checked={computedView === 'preview'}
                onClick={() => {
                  setView('preview');
                }}
              >
                <>
                  {computedView === 'preview' && (
                    <DropdownMenu.ItemIndicator className="dropdown-menu-item-indicator">
                      <Check className="h-3 w-3" />
                    </DropdownMenu.ItemIndicator>
                  )}
                  Preview
                </>
              </DropdownMenu.CheckboxItem>

              {/* <DropdownMenu.Item
                asChild
                onSelect={() => {
                  setView('preview');
                }}
              >
                <span className="dropdown-menu-item dropdown-menu-item-noindent block">
                  Preview
                </span>
              </DropdownMenu.Item> */}
              {file?.processed_markdown && (
                <DropdownMenu.CheckboxItem
                  className="dropdown-menu-item dropdown-menu-item-indent"
                  checked={computedView === 'markdown'}
                  onClick={() => {
                    setView('markdown');
                  }}
                >
                  <>
                    {computedView === 'markdown' && (
                      <DropdownMenu.ItemIndicator className="dropdown-menu-item-indicator">
                        <Check className="h-3 w-3" />
                      </DropdownMenu.ItemIndicator>
                    )}
                    Markdown
                  </>
                </DropdownMenu.CheckboxItem>
              )}
              <DropdownMenu.CheckboxItem
                className="dropdown-menu-item dropdown-menu-item-indent"
                checked={computedView === 'source'}
                onClick={() => {
                  setView('source');
                }}
              >
                <>
                  {computedView === 'source' && (
                    <DropdownMenu.ItemIndicator className="dropdown-menu-item-indicator">
                      <Check className="h-3 w-3" />
                    </DropdownMenu.ItemIndicator>
                  )}
                  Source
                </>
              </DropdownMenu.CheckboxItem>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
      <div className="mt-8 pb-24">
        {markdownContent ? (
          <>
            {computedView === 'preview' ? (
              <MarkdownContainer markdown={markdownContent} />
            ) : (
              <CodePanel
                className="text-sm"
                language={
                  computedView === 'markdown' ? 'markdown' : toLanguage(file)
                }
                code={
                  (computedView === 'markdown'
                    ? file?.processed_markdown
                    : file?.raw_content) || ''
                }
              />
            )}
          </>
        ) : (
          <p className="select-none text-sm text-neutral-700">Empty content</p>
        )}
      </div>
    </div>
  );
};
