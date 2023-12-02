import { toast } from 'sonner';

import { setSourceData } from '@/lib/api';
import { setMetadata } from '@/lib/integrations/nango.client';
import {
  DbSource,
  NangoSourceDataType,
  Project,
  SyncMetadata,
} from '@/types/types';

export const prepareFields = (input: string) => {
  return input.split(',').map((v) => v.trim());
};

export const updateSourceData = async (
  projectId: Project['id'] | undefined,
  source: DbSource | undefined,
  syncMetadata: SyncMetadata | undefined,
  sourceData: NangoSourceDataType | undefined,
  newSourceData: Partial<NangoSourceDataType>,
  setSubmitting: (submitting: boolean) => void,
  mutateSources: () => void,
  onDidCompletedOrSkip: (() => void) | undefined,
) => {
  if (
    !projectId ||
    !source ||
    !sourceData?.integrationId ||
    !sourceData?.connectionId
  ) {
    return;
  }

  setSubmitting(true);

  await setSourceData(projectId, source.id, {
    ...(source.data as any),
    ...newSourceData,
    syncMetadata: {
      ...syncMetadata,
      ...newSourceData.syncMetadata,
    },
  });

  if (newSourceData?.syncMetadata) {
    await setMetadata(
      projectId,
      sourceData.integrationId,
      sourceData.connectionId,
      {
        ...syncMetadata,
        ...newSourceData?.syncMetadata,
      },
    );
  }

  setSubmitting(false);
  toast.success('Configuration has been updated');
  onDidCompletedOrSkip?.();
  await mutateSources();
};
