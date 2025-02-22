import { isPresent } from 'ts-is-present';

import { getFileExtension, shouldIncludeFileWithPath } from '../utils';

export const isMotifProjectAccessible = async (projectDomain: string) => {
  const res = await fetch(
    `https://api.motif.land/v1/projects/project-domain/${projectDomain}`,
  );
  return res.ok;
};

// Motif serves the filename (e.g. index.mdoc or my-post.mdx) as well
// as the computed url path (/docs or /blog/my-post). Given these
// two infos, we recreated the file path.
const toFilePath = (urlPath: string, filename: string) => {
  if (filename.toLowerCase().startsWith('index.')) {
    return `${urlPath}/${filename}`;
  } else {
    const fileExtension = getFileExtension(filename);
    return `${urlPath}.${fileExtension}`;
  }
};

export const getMotifPublicFileMetadata = async (
  projectDomain: string,
  includeGlobs: string[],
  excludeGlobs: string[],
): Promise<{ id: string; name: string; path: string }[]> => {
  const res = await fetch(
    `https://api.motif.land/v1/projects/project-domain/${projectDomain}`,
  );

  if (!res.ok) {
    return [];
  }

  const json = await res.json();

  return (json.data || []).files
    .map((f: any) => {
      const fullFilePath = toFilePath(f.path, f.name);
      if (
        shouldIncludeFileWithPath(
          fullFilePath,
          includeGlobs,
          excludeGlobs,
          false,
        )
      ) {
        return { id: f.id, name: f.name, path: fullFilePath };
      }
      return undefined;
    })
    .filter(isPresent);
};

export const getMotifFileContent = async (id: string): Promise<string> => {
  const res = await fetch(`https://api.motif.land/v1/exports/raw/${id}`);
  if (!res.ok) {
    return '';
  }
  return res.text();
};

export const extractProjectDomain = (url: string) => {
  // eslint-disable-next-line no-useless-escape
  const match = url.match(/^(https?:\/\/)?([^\/.]+)\.\w+\.\w+(?:\/|$)*/);
  if (match && match.length > 2) {
    return match[2];
  }
  return undefined;
};
