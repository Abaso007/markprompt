import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';

import { FileData } from '@/types/types';

import { getChecksums, processFile, setChecksums } from '../api';
import { getGitHubMDFiles, getOwnerRepoString } from '../github';
import useFiles from '../hooks/use-files';
import useProject from '../hooks/use-project';
import useSources from '../hooks/use-sources';
import {
  createChecksum,
  pluralize,
  shouldIncludeFileWithPath,
  truncate,
} from '../utils';

type IdleState = { state: 'idle' };
type FetchingDataState = { state: 'fetching_data' };
type LoadingState = {
  state: 'loading';
  progress?: number;
  total?: number;
  filename?: string;
  message?: string;
};
type CancelRequestsState = { state: 'cancel_requested' };
type CompleteState = { state: 'complete'; errors: string[] };

export type TrainingState =
  | IdleState
  | FetchingDataState
  | LoadingState
  | CancelRequestsState
  | CompleteState;

export type State = {
  state: TrainingState;
  errors: string[];
  generateEmbeddings: (
    numFiles: number,
    getFileMeta: (
      index: number,
    ) => Pick<FileData, 'name' | 'path'> & { checksum: string },
    getFileContent: (index: number) => Promise<string>,
    onFileProcessed?: () => void,
    forceRetrain?: boolean,
  ) => Promise<void>;
  stopGeneratingEmbeddings: () => void;
  trainAllSources: (
    onFileProcessed: () => void,
    onError: (message: string) => void,
  ) => void;
};

const initialState: State = {
  state: { state: 'idle' },
  errors: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  generateEmbeddings: async () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  stopGeneratingEmbeddings: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  trainAllSources: () => {},
};

export const getTrainingStateMessage = (
  state: TrainingState,
  numFiles?: number,
) => {
  if (state.state === 'loading') {
    return `Processing file ${state.progress} of ${state.total}${
      state.filename ? ` (${truncate(state.filename, 20)})` : '.'
    }`;
  } else if (state.state === 'complete') {
    return 'Done processing files.';
  } else if (state.state === 'cancel_requested') {
    return 'Stopping processing...';
  }
  if (typeof numFiles !== 'undefined') {
    return `${pluralize(numFiles, 'file', 'files')} added.`;
  }
  return '';
};

const TrainingContextProvider = (props: PropsWithChildren) => {
  const { project, config } = useProject();
  const { mutate: mutateFiles } = useFiles();
  const [state, setState] = useState<TrainingState>({ state: 'idle' });
  const [errors, setErrors] = useState<string[]>([]);
  const stopFlag = useRef(false);
  const { sources } = useSources();

  const generateEmbeddings = useCallback(
    async (
      numFiles: number,
      getFileMeta: (
        index: number,
      ) => Pick<FileData, 'name' | 'path'> & { checksum: string },
      getFileContent: (index: number) => Promise<string>,
      onFileProcessed?: () => void,
      forceRetrain = false,
    ) => {
      if (!project?.id) {
        return;
      }

      setErrors([]);

      const checksums: { [key: FileData['path']]: string } = await getChecksums(
        project.id,
      );

      for (let i = 0; i < numFiles; i++) {
        if (stopFlag.current) {
          stopFlag.current = false;
          break;
        }

        // Only pick the metadata, not the full file content, since this
        // could be an expensive operation (GitHub) that might not be
        // needed if the checksums match.
        const fileMeta = getFileMeta(i);

        if (
          !shouldIncludeFileWithPath(
            fileMeta.path,
            config.include || [],
            config.exclude || [],
          )
        ) {
          console.info('Skipping', fileMeta.path);
          continue;
        }

        setState({
          state: 'loading',
          progress: i + 1,
          total: numFiles,
          filename: fileMeta.name,
        });

        // Check the checksum (or SHA if GitHub file), and skip if equals.
        if (!forceRetrain && checksums[fileMeta.path] === fileMeta.checksum) {
          console.info('Skipping', fileMeta.path);
          continue;
        }

        console.info('Processing', fileMeta.path);

        const content = await getFileContent(i);
        const file = { ...fileMeta, content };

        try {
          await processFile(project.id, file, forceRetrain);
          // Right after a file has been processed, update the
          // project checksums, so that they are not lost if the
          // operation is aborted.
          checksums[file.path] = fileMeta.checksum;
          await setChecksums(project.id, checksums);
          onFileProcessed?.();
        } catch (e) {
          console.error('Error', e);
          setErrors((errors) => [
            ...errors,
            `Error processing ${file.name}: ${e}`,
          ]);
        }
      }

      setState({ state: 'idle' });
    },
    [project?.id, config],
  ) satisfies State['generateEmbeddings'];

  const trainAllSources = useCallback(
    async (onFileProcessed: () => void, onError: (message: string) => void) => {
      for (const source of sources) {
        setState({ state: 'fetching_data' });
        const githubUrl = (source.data as any)?.['url'];

        let mdFiles: FileData[] = [];
        try {
          mdFiles = await getGitHubMDFiles(
            githubUrl,
            config.include || [],
            config.exclude || [],
          );
        } catch (e) {
          const repoOwner = getOwnerRepoString(githubUrl);
          onError(`Error processing ${repoOwner}: ${e}`);
          continue;
        }
        await generateEmbeddings(
          mdFiles.length,
          (i) => {
            const file = mdFiles[i];
            const content = file.content;
            return {
              name: file.name,
              path: file.path,
              checksum: createChecksum(content),
            };
          },
          async (i) => mdFiles[i].content,
          () => {
            onFileProcessed();
          },
        );
      }
    },
    [sources],
  );

  const stopGeneratingEmbeddings = useCallback(() => {
    stopFlag.current = true;
    setState({ state: 'cancel_requested' });
  }, []);

  return (
    <TrainingContext.Provider
      value={{
        state,
        errors,
        generateEmbeddings,
        stopGeneratingEmbeddings,
        trainAllSources,
      }}
      {...props}
    />
  );
};

export const useTrainingContext = (): State => {
  const context = useContext(TrainingContext);
  if (context === undefined) {
    throw new Error(
      `useTrainingContext must be used within a TrainingContextProvider`,
    );
  }
  return context;
};

export const TrainingContext = createContext<State>(initialState);

TrainingContext.displayName = 'TrainingContext';

export const ManagedTrainingContext: FC<PropsWithChildren> = ({ children }) => (
  <TrainingContextProvider>{children}</TrainingContextProvider>
);
