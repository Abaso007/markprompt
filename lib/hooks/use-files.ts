import { SortingState } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo } from 'react';
import useSWR from 'swr';

import { DbFileWithoutContent, DbSource } from '@/types/types';

import useProject from './use-project';
import useSources from './use-sources';
import { useLocalStorage } from './utils/use-localstorage';
import { fetcher, formatUrl } from '../utils';

const defaultSorting = {
  id: 'updated',
  desc: true,
};

export default function useFiles() {
  const { project } = useProject();
  const { sources } = useSources();
  const [page, setPage] = useLocalStorage<number>(
    !project?.id ? null : `${project?.id}:data:page`,
    0,
  );

  // Using a non-primitive value, like an array, causes the useLocalStorage
  // effect to trigger infinitely.
  const [storedSourcesString, setStoredSourcesString] = useLocalStorage<
    string | undefined
  >(!project?.id ? null : `${project?.id}:data:filters:sources`, undefined);

  const [storedSortingString, setStoredSortingString] = useLocalStorage<
    string | undefined
  >(
    !project?.id ? null : `${project?.id}:data:sorting`,
    JSON.stringify([defaultSorting]),
  );

  const pageSize = 50;

  const sourceIdsFilter = useMemo(() => {
    if (!storedSourcesString) {
      return [];
    }
    return JSON.parse(storedSourcesString) as string[];
  }, [storedSourcesString]);

  const sorting: SortingState = useMemo(() => {
    if (!storedSortingString) {
      return [];
    }
    return JSON.parse(storedSortingString) as SortingState;
  }, [storedSortingString]);

  const {
    data: paginatedFiles,
    mutate,
    error,
  } = useSWR(
    project?.id
      ? formatUrl(`/api/project/${project.id}/files`, {
          limit: `${pageSize}`,
          page: `${page || 0}`,
          sorting:
            sorting.length > 0
              ? JSON.stringify(sorting[0])
              : JSON.stringify(defaultSorting),
          ...(sourceIdsFilter?.length > 0
            ? { sourceIdsFilter: JSON.stringify(sourceIdsFilter) }
            : {}),
        })
      : null,
    fetcher<DbFileWithoutContent[]>,
  );

  const { data: countData, mutate: mutateCount } = useSWR(
    project?.id ? `/api/project/${project.id}/files/count` : null,
    fetcher<{ count: number }>,
  );

  const { data: countWithFilters, mutate: mutateCountWithFilters } = useSWR(
    project?.id
      ? formatUrl(`/api/project/${project.id}/files/count-with-filters`, {
          ...(sourceIdsFilter?.length > 0
            ? { sourceIdsFilter: JSON.stringify(sourceIdsFilter) }
            : {}),
        })
      : null,
    fetcher<{ count: number }>,
  );

  const loading = !paginatedFiles && !error;
  const numFiles = countData?.count || 0;
  const numFilesWithFilters = countWithFilters?.count || 0;
  const hasMorePages = ((page || 0) + 1) * pageSize < numFiles;

  useEffect(() => {
    if (!storedSourcesString || sources?.length === 0) {
      return;
    }
    const sourceIds = sources?.map((s) => s.id) || [];
    const availableSources = (JSON.parse(storedSourcesString) || []).filter(
      (s: string) => sourceIds.includes(s),
    );
    if (availableSources.length !== storedSourcesString?.length) {
      setStoredSourcesString(JSON.stringify(availableSources));
    }
  }, [setStoredSourcesString, sources, storedSourcesString]);

  const setSourceIdsFilter = useCallback(
    (ids: DbSource['id'][]) => {
      // Reset page count to avoid blank pages
      setPage(0);
      setStoredSourcesString(JSON.stringify(ids));
    },
    [setPage, setStoredSourcesString],
  );

  const toggleSorting = useCallback(
    (id: string, start: 'asc' | 'desc') => {
      let newSorting: SortingState = [];
      const found = sorting.find((s) => s.id === id);
      if (!found) {
        newSorting = [{ id, desc: start === 'asc' ? false : true }];
      } else {
        if (
          (start === 'asc' && found.desc === false) ||
          (start === 'desc' && found.desc === true)
        ) {
          // Toggle to next step
          newSorting = [{ id, desc: start === 'asc' }];
        } else {
          // Already at step 2, so reset to default sorting
          newSorting = [defaultSorting];
        }
      }
      setStoredSortingString(JSON.stringify(newSorting));
    },
    [setStoredSortingString, sorting],
  );

  const getSortOrder = (id: string): 'asc' | 'desc' | null => {
    const found = sorting.find((s) => s.id === id);
    if (found) {
      return found.desc ? 'desc' : 'asc';
    }
    return null;
  };

  return {
    paginatedFiles,
    loading,
    mutate,
    page,
    pageSize,
    hasMorePages,
    setPage,
    sorting,
    toggleSorting,
    getSortOrder,
    sourceIdsFilter,
    setSourceIdsFilter,
    numFiles,
    mutateCount,
    numFilesWithFilters,
    mutateCountWithFilters,
  };
}
