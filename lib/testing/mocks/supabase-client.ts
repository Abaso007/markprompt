import { DbFile, FileSections } from '@/types/types';

export let mockSupabaseFiles: DbFile[] = [];
export let mockSupabaseFileSections: FileSections[] = [];

export const resetMockSupabaseData = () => {
  mockSupabaseFiles = [];
  mockSupabaseFileSections = [];
};

export const supabaseClient = {
  from: (table: string) => ({
    select: (select: string) => ({
      eq: (eq1: string, value1: string) => ({
        eq: (eq2: string, value2: string) => ({
          then: (callback: any) => {
            if (
              table === 'files' &&
              select === 'id,meta,path,checksum' &&
              eq1 === 'source_id' &&
              eq2 === 'internal_metadata->>nangoFileId'
            ) {
              // getFilesIdAndCheksumBySourceAndNangoId
              callback({
                data: {
                  id: 'test-file-id-1',
                  meta: { title: 'Test title 1' },
                  path: '/test/path/1',
                  checksum: 'abc',
                },
              });
              return {
                catch: () => {
                  // Do nothing
                },
              };
            }
          },
        }),
        limit: (limit: number) => ({
          maybeSingle: () => ({
            then: (callback: any) => {
              if (
                table === 'sources' &&
                select === 'id' &&
                eq1 === 'data->>connectionId'
              ) {
                callback({ data: { id: 'test-source-id' } });
                return {
                  catch: () => {
                    // Do nothing
                  },
                };
              }
            },
          }),
        }),
      }),
      match: (obj: any) => ({
        limit: (limit: number) => ({
          maybeSingle: () => ({
            then: (callback: any) => {
              if (obj?.['source_id'] && obj?.['path']) {
                callback({ data: { id: 'test-source-id' } });
                return {
                  catch: () => {
                    // Do nothing
                  },
                };
              }
            },
          }),
        }),
      }),
    }),
    insert: (values: any[]) => {
      if (table === 'files') {
        return {
          select: (select: string) => ({
            limit: (limit: number) => ({
              maybeSingle: () => ({
                then: (callback: any) => {
                  // createFile
                  for (const value of values) {
                    mockSupabaseFiles.push({
                      ...value,
                      id: Math.round(Math.pow(10, 8) * Math.random()),
                    });
                  }

                  callback({
                    data: { id: mockSupabaseFiles[0].id },
                  });
                  return {
                    catch: () => {
                      // Do nothing
                    },
                  };
                },
              }),
            }),
          }),
        };
      } else if (table === 'file_sections') {
        return {
          then: async (callback: any) => {
            for (const value of values) {
              mockSupabaseFileSections.push({
                ...value,
                id: Math.round(Math.pow(10, 8) * Math.random()),
              });
            }

            callback({});
            return {
              catch: () => {
                // Do nothing
              },
            };
          },
        };
      }
    },
    delete: () => ({
      in: (key: string, values: any[]) => ({
        then: (callback: any) => {
          // batchDeleteFiles
          if (table === 'files' && key === 'id') {
            mockSupabaseFiles = mockSupabaseFiles.filter(
              (f) => !values.includes(f.id),
            );
          }
          callback();
          return {
            catch: () => {
              // Do nothing
            },
          };
        },
      }),
      eq: (eqKey: string, eqValue: any) => ({
        in: (inKey: string, inValues: any[]) => ({
          then: (callback: any) => {
            // batchDeleteFilesBySourceAndNangoId
            if (
              table === 'files' &&
              eqKey === 'source_id' &&
              inKey === 'internal_metadata->>nangoFileId'
            ) {
              mockSupabaseFiles = mockSupabaseFiles.filter((f) => {
                if (f.source_id === eqValue) {
                  return false;
                }
                if (
                  inValues.includes((f.internal_metadata as any)?.nangoFileId)
                ) {
                  return false;
                }
              });
            }
            callback();
            return {
              catch: () => {
                // Do nothing
              },
            };
          },
        }),
      }),
    }),
  }),
};
