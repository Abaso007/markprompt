import { FC, useMemo } from 'react';

import { GitHubIcon } from '@/components/icons/GitHub';
import { Tag } from '@/components/ui/Tag';
import useSources from '@/lib/hooks/use-sources';
import {
  DbSource,
  GitHubRepoSyncMetadata,
  NangoSourceDataType,
  Project,
  SourceConfigurationView,
} from '@/types/types';

import { BaseConfigurationDialog } from './BaseConfiguration';
import { GitHubRepoSettings } from '../settings-panes/GitHubRepo';

type GitHubRepoConfigurationDialogProps = {
  projectId: Project['id'];
  sourceId?: DbSource['id'];
  defaultView?: SourceConfigurationView;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const GitHubRepoConfigurationDialog: FC<GitHubRepoConfigurationDialogProps> = ({
  projectId,
  sourceId,
  defaultView,
  open,
  onOpenChange,
}) => {
  const { sources } = useSources();

  const source = useMemo(() => {
    return sources?.find((s) => s.id === sourceId);
  }, [sources, sourceId]);

  const syncMetadata = (source?.data as NangoSourceDataType)
    ?.syncMetadata as GitHubRepoSyncMetadata;

  return (
    <BaseConfigurationDialog
      source={source}
      customMetadata={
        syncMetadata
          ? [
              {
                label: 'Repository',
                value: `${syncMetadata.owner}/${syncMetadata.repo}`,
                accessory: syncMetadata.branch ? (
                  <Tag color="sky" rounded>
                    #{syncMetadata.branch}
                  </Tag>
                ) : undefined,
                href: `https://github.com/${syncMetadata.owner}/${syncMetadata.repo}`,
              },
            ]
          : []
      }
      defaultView={defaultView}
      open={open}
      onOpenChange={onOpenChange}
      Icon={GitHubIcon}
    >
      <GitHubRepoSettings
        projectId={projectId}
        source={source}
        forceDisabled={false}
      />
    </BaseConfigurationDialog>
  );
};

export default GitHubRepoConfigurationDialog;
