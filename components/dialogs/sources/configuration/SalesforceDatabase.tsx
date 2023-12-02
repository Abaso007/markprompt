import { FC, useMemo } from 'react';
import { isPresent } from 'ts-is-present';

import { SalesforceIcon } from '@/components/icons/Salesforce';
import useSources from '@/lib/hooks/use-sources';
import {
  getIntegrationEnvironment,
  getIntegrationEnvironmentName,
  getIntegrationId,
} from '@/lib/integrations/nango';
import { removeTrailingSlash } from '@/lib/utils';
import {
  DbSource,
  NangoSourceDataType,
  Project,
  SourceConfigurationView,
} from '@/types/types';

import { BaseConfigurationDialog } from './BaseConfiguration';
import { SalesforceDatabaseSettings } from '../settings-panes/SalesforceDatabase';

type SalesforceDatabaseConfigurationDialogProps = {
  projectId: Project['id'];
  sourceId?: DbSource['id'];
  defaultView?: SourceConfigurationView;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const SalesforceDatabaseConfigurationDialog: FC<
  SalesforceDatabaseConfigurationDialogProps
> = ({ projectId, sourceId, defaultView, open, onOpenChange }) => {
  const { sources } = useSources();

  const source = useMemo(() => {
    return sources?.find((s) => s.id === sourceId);
  }, [sources, sourceId]);

  const integrationId = source && getIntegrationId(source);

  // Proper to integrations like Salesforce
  const integrationEnvironment =
    integrationId && getIntegrationEnvironment(integrationId);
  const instanceUrl = (source?.data as NangoSourceDataType)?.connectionConfig
    ?.instance_url;

  return (
    <BaseConfigurationDialog
      source={source}
      customMetadata={[
        integrationEnvironment
          ? {
              label: 'Environment',
              value: getIntegrationEnvironmentName(integrationEnvironment),
            }
          : undefined,
        instanceUrl
          ? {
              label: 'Instance URL',
              value: removeTrailingSlash(instanceUrl),
              href: instanceUrl,
            }
          : undefined,
      ].filter(isPresent)}
      defaultView={defaultView}
      open={open}
      onOpenChange={onOpenChange}
      Icon={SalesforceIcon}
    >
      <SalesforceDatabaseSettings
        projectId={projectId}
        source={source}
        forceDisabled={false}
      />
    </BaseConfigurationDialog>
  );
};

export default SalesforceDatabaseConfigurationDialog;
