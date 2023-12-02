import { Tag } from '@/components/ui/Tag';
import { DbSyncQueueOverview, LogLevel } from '@/types/types';

export const SyncQueueTag = ({
  status,
}: {
  status: DbSyncQueueOverview['status'];
}) => {
  switch (status) {
    case 'complete':
      return <Tag color="green">Synced</Tag>;
    case 'canceled':
      return <Tag color="orange">Canceled</Tag>;
    case 'errored':
      return <Tag color="red">Errored</Tag>;
    case 'running':
      return <Tag color="fuchsia">Syncing</Tag>;
  }
};

export const LogLevelTag = ({ level }: { level: LogLevel }) => {
  switch (level) {
    case 'debug':
      return <Tag color="fuchsia">Debug</Tag>;
    case 'error':
      return <Tag color="red">Error</Tag>;
    case 'info':
      return <Tag color="sky">Info</Tag>;
    case 'warn':
      return <Tag color="orange">Warning</Tag>;
  }
};
