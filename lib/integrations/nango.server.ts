import { Nango } from '@nangohq/node';
import type { SupabaseClient } from '@supabase/supabase-js';

import { NangoSyncPayload } from '@/pages/api/inngest';
import type { Database } from '@/types/supabase';
import { DbSource, NangoSourceDataType, SyncData } from '@/types/types';

import { getSyncId } from './nango';
import { TeamTierInfo, isAutoSyncEnabled } from '../stripe/tiers';
import { getProjectIdFromSource } from '../supabase';

export const getNangoServerInstance = () => {
  return new Nango({
    secretKey:
      process.env.NODE_ENV === 'production'
        ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          process.env.NANGO_SECRET_KEY_PROD!
        : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          process.env.NANGO_SECRET_KEY_DEV!,
  });
};

export const getSourceId = async (
  supabase: SupabaseClient<Database>,
  connectionId: string,
): Promise<DbSource['id'] | undefined> => {
  const { data } = await supabase
    .from('sources')
    .select('id')
    .eq('data->>connectionId', connectionId)
    .limit(1)
    .maybeSingle();
  return data?.id;
};

export const getSourceSyncData = async (
  supabase: SupabaseClient<Database>,
  connectionId: string,
): Promise<Pick<DbSource, 'id' | 'data'> | undefined> => {
  const { data } = await supabase
    .from('sources')
    .select('id,data')
    .eq('data->>connectionId', connectionId)
    .limit(1)
    .maybeSingle();
  if (!data) {
    return undefined;
  }
  return data;
};

export const shouldPauseSync = async (
  supabase: SupabaseClient<Database>,
  nangoSyncPayload: NangoSyncPayload,
) => {
  const sourceSyncData = await getSourceSyncData(
    supabase,
    nangoSyncPayload.connectionId,
  );

  if (!sourceSyncData) {
    return true;
  }

  const projectId = await getProjectIdFromSource(supabase, sourceSyncData.id);

  if (!projectId) {
    return true;
  }

  const { data } = await supabase
    .from('projects')
    .select('id,teams(stripe_price_id,plan_details)')
    .eq('id', projectId)
    .limit(1)
    .maybeSingle();

  if (!data?.teams) {
    return true;
  }

  return !isAutoSyncEnabled(data.teams as TeamTierInfo);
};

export const pauseConnection = async (
  supabase: SupabaseClient<Database>,
  connectionId: string,
) => {
  const sourceSyncData = await getSourceSyncData(supabase, connectionId);
  const data = sourceSyncData?.data as NangoSourceDataType;
  const integrationId = data.integrationId;

  if (!integrationId || !connectionId) {
    return;
  }

  const syncId = getSyncId(integrationId);

  await pauseSyncForSource(supabase, {
    integrationId,
    connectionId,
    syncId,
  });
};

const pauseSyncForSource = async (
  supabase: SupabaseClient<Database>,
  data: SyncData,
) => {
  if (!data.integrationId || !data.connectionId || !data.syncId) {
    return;
  }

  const sourceId = await getSourceId(supabase, data.connectionId);

  if (!sourceId) {
    throw new Error('Source not found.');
  }

  const nango = getNangoServerInstance();

  const syncStatuses = await nango.syncStatus(
    data.integrationId,
    [data.syncId],
    data.connectionId,
  );

  for (const sync of syncStatuses.syncs) {
    switch (sync.status) {
      case 'RUNNING':
      case 'SUCCESS': {
        await nango.pauseSync(
          data.integrationId,
          [data.syncId],
          data.connectionId,
        );
        break;
      }
    }
  }
};

export const deleteConnection = async (
  supabase: SupabaseClient<Database>,
  connectionId: string,
) => {
  const sourceSyncData = await getSourceSyncData(supabase, connectionId);
  const data = sourceSyncData?.data as NangoSourceDataType;
  const integrationId = data.integrationId;

  if (!integrationId || !connectionId) {
    return;
  }

  const nango = getNangoServerInstance();

  await nango.deleteConnection(integrationId, connectionId);
};
