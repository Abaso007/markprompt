import * as Dialog from '@radix-ui/react-dialog';
import { Field, Formik, FormikErrors, FormikValues } from 'formik';
import { ReactNode, useCallback, useState } from 'react';
import { toast } from 'sonner';

import Button from '@/components/ui/Button';
import { FormField, FormLabel, FormRoot } from '@/components/ui/Forms';
import { NoAutoInput } from '@/components/ui/Input';
import useProject from '@/lib/hooks/use-project';
import useSources from '@/lib/hooks/use-sources';
import { getNangoClientInstance } from '@/lib/integrations/nango.client';
import { extractGithubRepo } from '@/lib/utils.nodeps';
import { DbSource, Project } from '@/types/types';

import {
  SyncStep,
  addSourceAndNangoConnection,
  isIntegrationAuthed,
} from './shared';
import { Step, ConnectSourceStepState } from './Step';
import { GitHubRepoSettings } from '../settings-panes/GitHubRepo';
import SourceDialog from '../SourceDialog';

const ConnectStep = ({
  projectId,
  state,
  onDidConnect,
}: {
  projectId: Project['id'];
  state: ConnectSourceStepState;
  onDidConnect: (source: DbSource) => void;
}) => {
  const { mutate: mutateSources } = useSources();

  const connect = useCallback(
    async (
      owner: string,
      repo: string,
      branch: string | null,
      setSubmitting: (submitting: boolean) => void,
    ) => {
      try {
        const nango = getNangoClientInstance();

        setSubmitting(true);
        const integrationId = 'github-repo';
        const name = repo;
        const newSource = await addSourceAndNangoConnection(
          nango,
          projectId,
          integrationId,
          name,
          undefined,
          { owner, repo, ...(branch ? { branch } : {}) },
          isIntegrationAuthed(integrationId),
        );

        if (!newSource) {
          toast.error('Error connecting to GitHub');
          return;
        }

        await mutateSources();
        setSubmitting(false);
        onDidConnect(newSource);
        toast.success('Connected to GitHub');
      } catch (e: any) {
        setSubmitting(false);
        console.error('Error auth', e);
        if (e?.type === 'callback_err' || e?.type === 'windowClosed') {
          // This is the error that is thrown when the user closes or
          // cancels the auth popup. No need to show an error here
          toast.error('Connection canceled');
          return;
        }
        toast.error('Error connecting to GitHub');
      }
    },
    [projectId, mutateSources, onDidConnect],
  );

  const isEditingState = !(state === 'not_started' || state === 'complete');

  return (
    <Step
      title="Authorize"
      description="Enter a repository to sync."
      state={state}
    >
      <Formik
        initialValues={{ url: '' }}
        enableReinitialize
        validateOnMount
        validate={async (values) => {
          const errors: FormikErrors<FormikValues> = {};
          if (!extractGithubRepo(values.url)) {
            errors.url = 'Invalid repository URL';
          }
          return errors;
        }}
        onSubmit={async (values, { setSubmitting }) => {
          const repo = extractGithubRepo(values.url);
          if (repo) {
            await connect(repo.owner, repo.repo, repo.branch, setSubmitting);
          } else {
            toast.error('Error connecting to GitHub');
          }
        }}
      >
        {({ isSubmitting, isValid, values }) => (
          <FormRoot>
            <FormField>
              <FormLabel>Repository URL</FormLabel>
              <Field
                className="flex-grow"
                type="text"
                name="url"
                inputSize="sm"
                placeholder="https://github.com/owner/repo"
                as={NoAutoInput}
                disabled={isSubmitting}
              />
            </FormField>
            <Button
              className="place-self-start"
              disabled={!isValid || !isEditingState}
              loading={isSubmitting}
              variant="plain"
              buttonSize="sm"
              type="submit"
            >
              {state === 'complete' ? 'Authorized' : 'Authorize GitHub'}
            </Button>
          </FormRoot>
        )}
      </Formik>
    </Step>
  );
};

const ConfigureStep = ({
  projectId,
  source,
  state,
  onDidCompleteOrSkip,
}: {
  projectId: Project['id'];
  source: DbSource | undefined;
  state: ConnectSourceStepState;
  onDidCompleteOrSkip: () => void;
}) => {
  return (
    <Step
      title="Configure"
      description="Configure the source. You can always change the configuration later."
      state={state}
    >
      <GitHubRepoSettings
        projectId={projectId}
        source={source}
        forceDisabled={state === 'not_started'}
        onDidCompletedOrSkip={onDidCompleteOrSkip}
      />
    </Step>
  );
};

const GitHubRepoOnboardingDialog = ({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}) => {
  const { project } = useProject();
  const [source, setSource] = useState<DbSource | undefined>(undefined);
  const [didCompleteConfiguration, setDidCompleteConfiguration] =
    useState(false);

  const reset = useCallback(() => {
    // Reset state on close
    setDidCompleteConfiguration(false);
    setSource(undefined);
  }, []);

  if (!project?.id) {
    return <></>;
  }

  return (
    <SourceDialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          reset();
        }
        onOpenChange?.(open);
      }}
      trigger={children && <Dialog.Trigger asChild>{children}</Dialog.Trigger>}
      title="Connect GitHub"
      description="Select a GitHub repository to sync."
    >
      <ConnectStep
        projectId={project.id}
        state={source ? 'complete' : 'in_progress'}
        onDidConnect={(source) => {
          setSource(source);
        }}
      />
      <ConfigureStep
        projectId={project.id}
        source={source}
        state={
          source && didCompleteConfiguration
            ? 'complete'
            : source
            ? 'in_progress'
            : 'not_started'
        }
        onDidCompleteOrSkip={() => {
          setDidCompleteConfiguration(true);
        }}
      />
      <SyncStep
        source={source}
        state={source ? 'in_progress' : 'not_started'}
        onComplete={() => {
          reset();
          onOpenChange?.(false);
        }}
      />
    </SourceDialog>
  );
};

export default GitHubRepoOnboardingDialog;
