import { Connection } from '@nangohq/node/dist/types';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { parseISO } from 'date-fns';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FC, JSXElementConstructor, ReactNode, useMemo, useState } from 'react';
import useSWR from 'swr';

import Button from '@/components/ui/Button';
import {
  FormField,
  FormHeading,
  FormHeadingGroup,
  FormLabel,
  FormSubHeading,
} from '@/components/ui/Forms';
import { CTABar } from '@/components/ui/SettingsCard';
import { Tag } from '@/components/ui/Tag';
import { formatShortDateTimeInTimeZone } from '@/lib/date';
import useProject from '@/lib/hooks/use-project';
import useSource from '@/lib/hooks/use-source';
import useSources from '@/lib/hooks/use-sources';
import useUser from '@/lib/hooks/use-user';
import {
  getIntegrationEnvironment,
  getIntegrationEnvironmentName,
  getIntegrationId,
  getIntegrationName,
  getSyncData,
} from '@/lib/integrations/nango';
import { fetcher, formatUrl, removeTrailingSlash } from '@/lib/utils';
import { removeSchema } from '@/lib/utils.nodeps';
import {
  DbSource,
  DbSyncQueueOverview,
  NangoSourceDataType,
  SourceConfigurationView,
} from '@/types/types';

import { SyncQueueLogs } from './SyncQueueLogs';
import { SyncQueueTag } from './utils';
import SourceDialog from '../SourceDialog';

const DeleteSourceDialog = dynamic(
  () => import('@/components/dialogs/sources/DeleteSource'),
);

type CustomMetadata = {
  label: string;
  value: string;
  accessory?: string | ReactNode;
  href?: string;
};

type BaseConfigurationDialogProps = {
  source?: DbSource;
  customMetadata?: CustomMetadata[];
  defaultView?: SourceConfigurationView;
  Icon?: JSXElementConstructor<any>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
};

const StopSyncButton = ({ source }: { source: DbSource }) => {
  const [isStopping, setStopping] = useState(false);
  const { stopSync } = useSource(source);

  return (
    <Button
      className="flex-none"
      variant="plain"
      buttonSize="sm"
      loading={isStopping}
      onClick={async () => {
        if (!source) {
          return;
        }
        setStopping(true);
        await stopSync();
        setStopping(false);
      }}
    >
      Stop syncing
    </Button>
  );
};

const RetrainOnlyButton = ({ source }: { source: DbSource }) => {
  const [isStarting, setStarting] = useState(false);
  // const { currentStatus, retrainOnly } = useSource(source);
  const { retrainOnly } = useSource(source);

  return (
    <Button
      className="flex-none"
      variant="plain"
      buttonSize="sm"
      // disabled={currentStatus === 'running'}
      loading={isStarting}
      onClick={async () => {
        if (!source) {
          return;
        }
        setStarting(true);
        await retrainOnly();
        setStarting(false);
      }}
    >
      Retrain only
    </Button>
  );
};

export const BaseConfigurationDialog: FC<BaseConfigurationDialogProps> = ({
  source,
  defaultView,
  customMetadata,
  Icon,
  open,
  onOpenChange,
  children,
}) => {
  const { project } = useProject();
  const { isSuperAdmin } = useUser();
  const { syncSources } = useSources();
  const { currentStatus, connection, lastSyncQueue } = useSource(source);
  const [syncStarted, setSyncStarted] = useState(false);
  const [showDeleteSourceDialog, setShowDeleteSourceDialog] = useState(false);

  const title = useMemo(() => {
    if (source?.type !== 'nango') {
      return 'Configuration';
    }
    const data = source?.data as NangoSourceDataType;
    return data?.name || getIntegrationName(data.integrationId);
  }, [source]);

  const integrationId = source && getIntegrationId(source);

  return (
    <SourceDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      Accessory={
        currentStatus ? (
          <SyncQueueTag status={currentStatus} />
        ) : (
          <Tag color="orange">Not synced</Tag>
        )
      }
    >
      <div className="flex h-full flex-col">
        <Tabs.Root
          className="TabsRoot flex-grow overflow-hidden"
          defaultValue={defaultView || 'configuration'}
        >
          <Tabs.List className="TabsList" aria-label="Configure source">
            <Tabs.Trigger className="TabsTrigger" value="configuration">
              Configuration
            </Tabs.Trigger>
            <Tabs.Trigger className="TabsTrigger" value="logs">
              Logs
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content
            className="TabsContent flex-grow overflow-y-auto px-4 py-8"
            value="configuration"
          >
            <div className="FormRoot mb-6 border-b border-neutral-900 pb-6">
              <FormField>
                <FormLabel>Source</FormLabel>
                <div className="flex flex-row items-center gap-2 overflow-hidden">
                  {Icon && (
                    <Icon className="h-5 w-5 flex-none text-neutral-500" />
                  )}
                  <div className="flex-grow overflow-hidden truncate text-sm text-neutral-300">
                    {integrationId ? getIntegrationName(integrationId) : ''}
                  </div>
                </div>
              </FormField>
              {customMetadata &&
                customMetadata.map((entry, i) => {
                  return (
                    <FormField key={`custom-metadata-${i}`}>
                      <FormLabel>{entry.label}</FormLabel>
                      <div className="flex flex-row items-center gap-2">
                        {entry.href ? (
                          <Link
                            href={entry.href}
                            target="_blank"
                            rel="noreferrer"
                            className="subtle-underline self-start truncate text-sm text-neutral-300"
                          >
                            {entry.value}
                          </Link>
                        ) : (
                          <div className="truncate text-sm text-neutral-300">
                            {entry.value}
                          </div>
                        )}
                        {entry.accessory}
                      </div>
                    </FormField>
                  );
                })}
            </div>
            {children}
            <div className="mt-8 flex flex-col items-start gap-2 border-t border-neutral-900 pt-8">
              {isSuperAdmin && connection && source && (
                <RetrainOnlyButton source={source} />
              )}
              <Button
                buttonSize="sm"
                variant="plainDanger"
                onClick={() => {
                  setShowDeleteSourceDialog(true);
                }}
              >
                Delete source
              </Button>
            </div>
          </Tabs.Content>
          <Tabs.Content
            className="TabsContent flex-grow overflow-y-auto"
            value="logs"
          >
            {project?.id && source?.id && (
              <SyncQueueLogs projectId={project.id} source={source} />
            )}
          </Tabs.Content>
        </Tabs.Root>
        <div className="flex-none">
          <CTABar>
            <div className="flex flex-grow flex-row items-center gap-2">
              <div className="flex-grow">
                {lastSyncQueue?.created_at && (
                  <p className="animate-fade-in text-xs text-neutral-500">
                    Last sync started on{' '}
                    {formatShortDateTimeInTimeZone(
                      parseISO(lastSyncQueue.created_at),
                    )}
                  </p>
                )}
              </div>
              {source && currentStatus === 'running' && (
                <StopSyncButton source={source} />
              )}
              <Button
                className="flex-none"
                loading={syncStarted}
                disabled={currentStatus === 'running'}
                variant="cta"
                buttonSize="sm"
                onClick={() => {
                  if (!source) {
                    return;
                  }
                  syncSources([source], setSyncStarted);
                }}
              >
                {currentStatus === 'running' ? 'Syncing...' : 'Sync now'}
              </Button>
            </div>
          </CTABar>
        </div>
      </div>
      {project?.id && source && (
        <Dialog.Root
          open={!!showDeleteSourceDialog}
          onOpenChange={() => setShowDeleteSourceDialog(false)}
        >
          <DeleteSourceDialog
            projectId={project.id}
            source={source}
            onComplete={() => setShowDeleteSourceDialog(false)}
          />
        </Dialog.Root>
      )}
    </SourceDialog>
  );
};
