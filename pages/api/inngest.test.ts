/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { createServiceRoleSupabaseClient } from '@/lib/supabase';
import { mockOpenAIAPIServer } from '@/lib/testing/mocks/openai-api';
import {
  mockSupabaseFileSections,
  mockSupabaseFiles,
  resetMockSupabaseData,
  supabaseClient,
} from '@/lib/testing/mocks/supabase-client';
import {
  DbFile,
  FileSections,
  NangoFileWithMetadata,
  SyncMetadataWithTargetSelectors,
} from '@/types/types';

import {
  FileTrainEventData,
  createFullMeta,
  isFileChanged,
  runTrainFile,
} from './inngest';

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => supabaseClient,
}));

describe('inngest', () => {
  describe('isFileChanged', () => {
    it('should detect whether a file has changed for training', () => {
      const newFile = {
        meta: { title: 'Hello', meta: { value: 1 } },
        path: '/path/to/file',
        checksum: 'abc',
      };
      expect(isFileChanged(newFile, newFile)).toBe(false);
      expect(
        isFileChanged(newFile, {
          ...newFile,
          meta: { meta: { value: 1 }, title: 'Hello' },
        }),
      ).toBe(false);
      expect(
        isFileChanged(newFile, {
          ...newFile,
          checksum: 'abcd',
        }),
      ).toBe(true);
      expect(
        isFileChanged(newFile, {
          ...newFile,
          path: '/other/path',
        }),
      ).toBe(true);
      expect(
        isFileChanged(newFile, {
          ...newFile,
          meta: { ...newFile.meta, meta: 1 },
        }),
      ).toBe(true);
    });
  });

  describe('createFullMeta', () => {
    it('should detect whether a file has changed for training', async () => {
      const baseNangoFile = {
        id: 'id',
        path: '/path',
        error: undefined,
      };
      expect(
        await createFullMeta({
          ...baseNangoFile,
          title: undefined,
          content: '<html><title>HTML Title</title></html>',
          contentType: 'html',
          meta: { title: 'Meta title', key: 1 },
        } as NangoFileWithMetadata),
      ).toStrictEqual({ title: 'HTML Title', key: 1 });
      expect(
        await createFullMeta({
          ...baseNangoFile,
          title: undefined,
          content: '---\ntitle: Frontmatter title\n---\n\n# Heading\n\nContent',
          contentType: 'mdx',
          meta: { title: 'Meta title', key: 1 },
        } as NangoFileWithMetadata),
      ).toStrictEqual({ title: 'Frontmatter title', key: 1 });
      expect(
        await createFullMeta({
          ...baseNangoFile,
          title: 'Nango title',
          content: '# Heading\n\nContent',
          contentType: 'md',
          meta: { key: 1 },
        } as NangoFileWithMetadata),
      ).toStrictEqual({ title: 'Nango title', key: 1 });
      expect(
        await createFullMeta({
          ...baseNangoFile,
          content: '',
          contentType: 'md',
          meta: {
            title: 'Nango title',
            key: 1,
          },
        } as NangoFileWithMetadata),
      ).toStrictEqual({ title: 'Nango title', key: 1 });
    });
  });

  describe('syncNangoRecords', () => {
    beforeAll(() => {
      mockOpenAIAPIServer.listen({ onUnhandledRequest: 'error' });
    });

    afterEach(() => {
      resetMockSupabaseData();
    });

    afterAll(() => {
      mockOpenAIAPIServer.close();
    });

    it('should sync records', async () => {
      const supabase = createServiceRoleSupabaseClient();

      const heading1 = 'Heading 1';
      const heading2 = 'Heading 2';
      const section1Content = `# ${heading1}\n\nSome Markdown content`;
      const section2Content = `# ${heading2}\n\nSome other content`;

      const fileTrainEventData: FileTrainEventData<SyncMetadataWithTargetSelectors> =
        {
          file: {
            id: 'test-id',
            path: '/test/path',
            title: 'Test file',
            compressedContent: compressToUTF16(
              `${section1Content}\n\n${section2Content}`,
            ),
            contentType: 'md',
            meta: { key: 'value' },
            lastModified: undefined,
            error: undefined,
            _nango_metadata: {
              deleted_at: null,
              last_action: 'UPDATED',
              first_seen_at: '2023-11-01',
              last_modified_at: '2023-11-01',
            },
          },
          projectId: 'test-project-id',
          sourceId: 'test-source-id',
          connectionId: '123',
          syncMetadata: {
            includeSelectors: undefined,
            excludeSelectors: undefined,
            processorOptions: undefined,
          },
        };

      await runTrainFile(fileTrainEventData);

      expect(mockSupabaseFileSections[0].file_id).toEqual(
        mockSupabaseFiles[0].id,
      );
      expect(
        (mockSupabaseFileSections[0] as any).meta.leadHeading.value,
      ).toEqual(heading1);
      expect((mockSupabaseFileSections[0] as any).content.trim()).toEqual(
        section1Content.trim(),
      );
      expect(mockSupabaseFileSections[1].file_id).toEqual(
        mockSupabaseFiles[0].id,
      );
      expect(
        (mockSupabaseFileSections[1] as any).meta.leadHeading.value,
      ).toEqual(heading2);
      expect((mockSupabaseFileSections[1] as any).content.trim()).toEqual(
        section2Content.trim(),
      );
    });
  });

  // This function currently uses the Nango client, which is not accessible
  // in a test environment (requires env variables), and we probably want
  // to mock the Nango client and not hit their APIs in unit tests.
  // describe('fetchGitHubFileContent', () => {
  //   it('should fetch GitHub file content', async () => {
  //     const file = await fetchGitHubFileContent(
  //       'motifland',
  //       'markprompt-sample-docs',
  //       'main',
  //       'docs/quick-start.mdoc',
  //       'test-connection-id',
  //     );

  //     expect(file.length).toBeGreaterThanOrEqual(0);
  //   }, 10000);
  // });
});
