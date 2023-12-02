/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NangoSync, NangoFile } from './models';

const PROVIDER_CONFIG_KEY = 'salesforce-case';

//
// START SHARED LOGGING CODE ==================================================
//

const getSyncQueueId = async (
  nango: NangoSync,
): Promise<string | undefined> => {
  const env = await nango.getEnvironmentVariables();
  const markpromptUrl = getEnv(env, 'MARKPROMPT_URL');
  const markpromptAPIToken = getEnv(env, 'MARKPROMPT_API_TOKEN');

  await nango.log(
    'getSyncQueueId - markpromptUrl: ' +
      markpromptUrl +
      ' : ' +
      markpromptAPIToken?.slice(0, 5),
  );

  if (!markpromptUrl || !markpromptAPIToken) {
    return undefined;
  }

  const res = await nango.proxy({
    method: 'GET',
    baseUrlOverride: markpromptUrl,
    endpoint: `/api/sync-queues/running?connectionId=${nango.connectionId!}`,
    providerConfigKey: PROVIDER_CONFIG_KEY,
    connectionId: nango.connectionId!,
    headers: {
      Authorization: `Bearer ${markpromptAPIToken}`,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
  });

  return res.data?.syncQueueId || undefined;
};

const pluralize = (value: number, singular: string, plural: string) => {
  return `${value} ${value === 1 ? singular : plural}`;
};

type LogLevel = 'info' | 'debug' | 'error' | 'warn';

const appendToLogFull = async (
  nango: NangoSync,
  syncQueueId: string | undefined,
  level: LogLevel,
  message: string,
) => {
  if (!syncQueueId) {
    return;
  }

  const env = await nango.getEnvironmentVariables();
  const markpromptUrl = getEnv(env, 'MARKPROMPT_URL');
  const markpromptAPIToken = getEnv(env, 'MARKPROMPT_API_TOKEN');

  if (!markpromptUrl || !markpromptAPIToken) {
    return;
  }

  await nango.log('appendToLogFull: ' + syncQueueId + ' ' + markpromptUrl);

  try {
    await nango.proxy({
      method: 'POST',
      baseUrlOverride: markpromptUrl,
      endpoint: `/api/sync-queues/${syncQueueId}/append-log`,
      providerConfigKey: PROVIDER_CONFIG_KEY,
      connectionId: nango.connectionId!,
      data: { message, level },
      headers: {
        Authorization: `Bearer ${markpromptAPIToken}`,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
    });
  } catch (e) {
    await nango.log(`Error posting log: ${e}`);
  }
};

type EnvEntry = { name: string; value: string };

const getEnv = (env: EnvEntry[] | null, name: string) => {
  return env?.find((v) => v.name === name)?.value;
};

//
// END SHARED LOGGING CODE ====================================================
//

interface Metadata {
  customFields: string[];
  filters: string;
  mappings: {
    title: string | undefined;
    content: string | undefined;
    path: string | undefined;
  };
  metadataFields: string[];
}

export default async function fetchData(nango: NangoSync) {
  const metadata = await nango.getMetadata<Metadata>();

  const fixedFields = ['Id', 'CaseNumber', 'Subject', 'LastModifiedDate'];
  const customFields = (metadata?.customFields || []).filter(
    (f) => !fixedFields.includes(f),
  );
  const fields = [...fixedFields, ...customFields];

  let query = `SELECT ${fields.join(
    ', ',
  )}, (SELECT Id, CommentBody, CreatedDate FROM CaseComments) FROM Case`;

  const filters = metadata?.filters;

  // let didSetWhere = false;
  if (filters?.length > 0) {
    // didSetWhere = true;
    query += ` WHERE (${filters})`;
  }

  // if (nango.lastSyncDate) {
  //   query += ` ${
  //     didSetWhere ? 'AND' : 'WHERE'
  //   } LastModifiedDate > ${nango.lastSyncDate.toISOString()}`;
  // }

  let endpoint = '/services/data/v53.0/query';

  const records: NangoFile[] = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const response = await nango.get({
      endpoint: endpoint,
      params: endpoint === '/services/data/v53.0/query' ? { q: query } : {},
    });

    const mappedRecords = mapRecords(
      response.data.records,
      metadata?.mappings,
      metadata?.metadataFields,
    );

    for (const mappedRecord of mappedRecords) {
      records.push(mappedRecord);
    }

    if (response.data.done) {
      break;
    }

    endpoint = response.data.nextRecordsUrl;
  }

  const syncQueueId = await getSyncQueueId(nango);

  await appendToLogFull(
    nango,
    syncQueueId,
    'info',
    `Fetched ${pluralize(
      records.length,
      'record',
      'records',
    )} from Salesforce Knowledge.`,
  );

  // Important: we have enabled track_deletes, which means that everything
  // that is not present in `batchSave` calls within a sync run will be deleted.
  // Therefore, we need to call `batchSave` only once. Otherwise, if the
  // script fails after a few calls to `batchSave`, everything else will be
  // deleted. We'd rather the script fails and doesn't delete any data.
  await nango.batchSave(records, 'NangoFile');
}

function mapRecords(
  records: any[],
  mappings: Metadata['mappings'],
  metadataFields: Metadata['metadataFields'],
): NangoFile[] {
  return records.map((record: any) => {
    return {
      id: record.Id,
      path: mappings.path ? record[mappings.path] : record.CaseNumber,
      title: mappings.title ? record[mappings.title] : record.Subject,
      content: mappings.content
        ? record[mappings.content]
        : (record.Description ? record.Description + '\n\n' : '') +
          (
            record.CaseComments?.records.map((comment: any) => {
              return comment.CommentBody;
            }) || []
          ).join('\n\n'),
      contentType: 'md',
      meta: {
        ...(metadataFields || []).reduce((acc, key) => {
          return { ...acc, [key]: record[key] };
        }, {}),
      },
      lastModified: record.LastModifiedDate
        ? new Date(record.LastModifiedDate)
        : new Date(),
      error: undefined,
    };
  });
}
