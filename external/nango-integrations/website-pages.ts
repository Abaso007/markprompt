/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { NangoSync, NangoFile } from './models';

const PROVIDER_CONFIG_KEY = 'website-pages';

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
  baseUrl: string;
  includeRegexes?: string[];
  excludeRegexes?: string[];
  requestHeaders?: { [key: string]: string };
}

type NangoWebpageFile = Pick<
  NangoFile,
  'id' | 'path' | 'content' | 'contentType' | 'lastModified' | 'error'
>;

type PageFetchResponse = {
  file: NangoWebpageFile;
  nextUrls?: string[];
};

const chunkArray = (arr: string[], chunkSize: number) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  return chunks;
};

const unique = (arr: string[]) => {
  const result: string[] = [];

  for (let i = 0; i < arr.length; i++) {
    const v = arr[i] as string;
    if (result.indexOf(v) === -1) {
      result.push(v);
    }
  }

  return result;
};

const fetchPageAndUrlsWithRetryWithThrows = async (
  nango: NangoSync,
  url: string,
  pageFetcherServiceBaseUrl: string,
  pageFetcherServicePath: string,
  pageFetcherServiceAPIToken: string,
  crawlerRoot: string,
  requestHeaders: { [key: string]: string } | undefined,
  includeRegexes: string[] | undefined,
  excludeRegexes: string[] | undefined,
  maxRetries: number,
): Promise<PageFetchResponse> => {
  // Note that this endpoint returns FULL urls. That is, it has resolved
  // e.g. absolute and relative URLs to their fully specified paths with
  // base URL prepended.

  await nango.log('Fetching ' + url);

  const res = await nango.proxy({
    method: 'POST',
    baseUrlOverride: pageFetcherServiceBaseUrl,
    endpoint: pageFetcherServicePath,
    providerConfigKey: PROVIDER_CONFIG_KEY,
    connectionId: nango.connectionId!,
    retries: maxRetries,
    data: {
      url,
      crawlerRoot,
      requestHeaders,
      includeRegexes,
      excludeRegexes,
      includePageUrls: true,
      shouldReturn200: true,
    },
    headers: {
      Authorization: `Bearer ${pageFetcherServiceAPIToken}`,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
  });

  if (typeof res.data?.error === 'string' && res.data.error.length > 0) {
    throw new Error(res.data.error);
  }

  return {
    file: {
      id: url,
      path: url,
      content: res.data.content,
      contentType: 'html',
      lastModified: undefined,
      error: undefined,
    },
    nextUrls: res.data.urls || [],
  };
};

const fetchPageAndUrlsWithRetry =
  (
    nango: NangoSync,
    pageFetcherServiceBaseUrl: string,
    pageFetcherServicePath: string,
    pageFetcherServiceAPIToken: string,
    crawlerRoot: string,
    requestHeaders: { [key: string]: string } | undefined,
    includeRegexes: string[] | undefined,
    excludeRegexes: string[] | undefined,
    maxRetries: number,
    appendToLog: (level: LogLevel, message: string) => Promise<void>,
  ) =>
  async (url: string): Promise<PageFetchResponse | undefined> => {
    try {
      const res = await fetchPageAndUrlsWithRetryWithThrows(
        nango,
        url,
        pageFetcherServiceBaseUrl,
        pageFetcherServicePath,
        pageFetcherServiceAPIToken,
        crawlerRoot,
        requestHeaders,
        includeRegexes,
        excludeRegexes,
        maxRetries,
      );
      return res;
    } catch (e) {
      await appendToLog('error', `Error importing ${url}: ${e}`);
    }

    return undefined;
  };

const parallelFetchPages = async (
  nango: NangoSync,
  pageFetcherServiceBaseUrl: string,
  pageFetcherServicePath: string,
  pageFetcherServiceAPIToken: string,
  crawlerRoot: string,
  urls: string[],
  requestHeaders: { [key: string]: string } | undefined,
  includeRegexes: string[] | undefined,
  excludeRegexes: string[] | undefined,
  appendToLog: (level: LogLevel, message: string) => Promise<void>,
): Promise<PageFetchResponse[]> => {
  return (
    await Promise.all(
      urls.map(
        fetchPageAndUrlsWithRetry(
          nango,
          pageFetcherServiceBaseUrl,
          pageFetcherServicePath,
          pageFetcherServiceAPIToken,
          crawlerRoot,
          requestHeaders,
          includeRegexes,
          excludeRegexes,
          3,
          appendToLog,
        ),
      ),
    )
  ).filter((f) => !!f) as PageFetchResponse[];
};

const fetchPages = async (
  nango: NangoSync,
  pageFetcherServiceBaseUrl: string,
  pageFetcherServicePath: string,
  pageFetcherServiceAPIToken: string,
  crawlerRoot: string,
  urls: string[],
  requestHeaders: { [key: string]: string } | undefined,
  includeRegexes: string[] | undefined,
  excludeRegexes: string[] | undefined,
  appendToLog: (level: LogLevel, message: string) => Promise<void>,
): Promise<{ files: NangoWebpageFile[]; nextUrls: string[] }> => {
  const files: NangoWebpageFile[] = [];
  const nextUrls: string[] = [];

  const parallelization = 40;
  const urlChunks = chunkArray(urls, parallelization);

  for (const urlChunk of urlChunks) {
    const filesWithUrls = await parallelFetchPages(
      nango,
      pageFetcherServiceBaseUrl,
      pageFetcherServicePath,
      pageFetcherServiceAPIToken,
      crawlerRoot,
      urlChunk,
      requestHeaders,
      includeRegexes,
      excludeRegexes,
      appendToLog,
    );
    filesWithUrls
      .flatMap((f) => f.file)
      .forEach((f) => {
        files.push(f);
      });
    filesWithUrls
      .flatMap((f) => f.nextUrls || [])
      .forEach((url) => {
        nextUrls.push(url);
      });
  }

  return { files, nextUrls: unique(nextUrls) };
};

export default async function fetchData(nango: NangoSync) {
  if (!nango.connectionId) {
    return;
  }

  const { baseUrl, includeRegexes, excludeRegexes, requestHeaders } =
    await nango.getMetadata<Metadata>();

  if (!baseUrl) {
    throw new Error('Missing base URL.');
  }

  const env = await nango.getEnvironmentVariables();
  const markpromptAPIToken = getEnv(env, 'MARKPROMPT_API_TOKEN');
  const pageFetcherServiceBaseUrl = getEnv(
    env,
    'CUSTOM_PAGE_FETCH_SERVICE_BASE_URL',
  );
  const pageFetcherServicePath = getEnv(env, 'CUSTOM_PAGE_FETCH_SERVICE_PATH');

  if (
    !pageFetcherServiceBaseUrl ||
    !pageFetcherServicePath ||
    !markpromptAPIToken
  ) {
    throw new Error('Missing service URLs or API token.');
  }

  const syncQueueId = await getSyncQueueId(nango);

  await nango.log('Retrieved syncQueueId: ' + syncQueueId);

  // const filesToSave: NangoWebpageFile[] = [];

  const processedUrls: string[] = [];
  let linksToProcess = [baseUrl];

  const maxAllowedPages = 10000;
  let numProcessedLinks = 0;

  await nango.log(`linksToProcess: ${JSON.stringify(linksToProcess)}`);

  const appendToLog = async (level: LogLevel, message: string) => {
    return appendToLogFull(nango, syncQueueId, level, message);
  };

  await appendToLog('info', `Start importing ${baseUrl}.`);

  let count = 0;

  while (linksToProcess.length > 0) {
    try {
      numProcessedLinks += linksToProcess.length;

      const { files, nextUrls } = await fetchPages(
        nango,
        pageFetcherServiceBaseUrl,
        pageFetcherServicePath,
        markpromptAPIToken,
        baseUrl,
        linksToProcess,
        requestHeaders,
        includeRegexes,
        excludeRegexes,
        appendToLog,
      );

      // files.forEach((file) => {
      //   filesToSave.push(file);
      // });

      await nango.batchSave(files, 'NangoFile');
      count += files.length;

      await nango.log('batchSave called on ' + files.length + ' files');

      linksToProcess.forEach((url) => {
        processedUrls.push(url);
      });

      linksToProcess = nextUrls
        .filter((url) => !processedUrls.includes(url))
        .slice(0, Math.max(0, maxAllowedPages - numProcessedLinks));

      await appendToLog(
        'info',
        `Saved ${pluralize(files.length, 'page', 'pages')}. ${
          linksToProcess.length > 0
            ? `Importing ${pluralize(
                linksToProcess.length,
                'new link',
                'new links',
              )}.`
            : 'No new links found.'
        }`,
      );
    } catch (e) {
      await appendToLog('error', `Error processing pages: ${e}`);
      await nango.log(`[website-pages] ERROR: ${e}`);
      throw e;
    }
  }

  await appendToLog(
    'info',
    `Done importing. Saved ${pluralize(
      count,
      'page',
      'pages',
    )} in total. Starting processing.`,
  );

  // await nango.batchSave(filesToSave, 'NangoFile');
}
