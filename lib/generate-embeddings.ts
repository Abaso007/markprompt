import Markdoc from '@markdoc/markdoc';
import type { SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { backOff } from 'exponential-backoff';
import type { Content, Root } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { mdxFromMarkdown } from 'mdast-util-mdx';
import { toMarkdown } from 'mdast-util-to-markdown';
import { mdxjs } from 'micromark-extension-mdxjs';
import TurndownService from 'turndown';
import { u } from 'unist-builder';
import { filter } from 'unist-util-filter';

import { CONTEXT_TOKENS_CUTOFF, MIN_CONTENT_LENGTH } from '@/lib/constants';
import { createEmbedding } from '@/lib/openai.edge';
import { createChecksum, getFileType } from '@/lib/utils';
import { extractFrontmatter } from '@/lib/utils.node';
import {
  DbFile,
  FileData,
  OpenAIModelIdWithType,
  Project,
  Source,
  geLLMInfoFromModel,
} from '@/types/types';

import { getProjectIdFromSource } from './supabase';
import { recordProjectTokenCount } from './tinybird';

type FileSectionData = {
  sections: string[];
  meta: any;
};

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

turndown.addRule('pre', {
  filter: 'pre',
  replacement: (content: string, node: any) => {
    const lang = node.getAttribute('data-language') || '';
    return `\n\n\`\`\`${lang}\n${content.trim()}\n\`\`\`\n\n`;
  },
});

const splitTreeBy = (tree: Root, predicate: (node: Content) => boolean) => {
  return tree.children.reduce<Root[]>((trees, node) => {
    const [lastTree] = trees.slice(-1);

    if (!lastTree || predicate(node)) {
      const tree: Root = u('root', [node]);
      return trees.concat(tree);
    }

    lastTree.children.push(node);
    return trees;
  }, []);
};

// Use `asMDX = false` for Markdoc content. What might happen in Markdoc
// is that the page contains a statement like `{HI_THERE}`, which is
// rendered verbatim in Markdown/Markdoc. It's also not a problem à priori
// for MDX, since it's semantically correct MDX (no eval is happening here).
// However, specifically for `{HI_THERE}` with an underscore, the Markdoc
// transform will escape the underscore, turning it into `{HI\_THERE}`, and
// then it's actually semantically incorrect MDX, because what goes inside the
// curly braces is treated as a variable/expression, and `HI\_THERE` is
// no a valid JS variable/expression, so the parsing will fail.
// Similarly, statements like "<10" are valid Markdown/Markdoc, but not
// valid MDX (https://github.com/micromark/micromark-extension-mdx-jsx/issues/7)
// and we don't want this to break Markdoc.
const splitMarkdownIntoSections = (
  content: string,
  asMDX: boolean,
): string[] => {
  const mdxTree = fromMarkdown(
    content,
    asMDX
      ? {
          extensions: [mdxjs()],
          mdastExtensions: [mdxFromMarkdown()],
        }
      : {},
  );

  // Remove all JSX and expressions from MDX
  const mdTree = filter(
    mdxTree,
    (node) =>
      ![
        'mdxjsEsm',
        'mdxJsxFlowElement',
        'mdxJsxTextElement',
        'mdxFlowExpression',
        'mdxTextExpression',
      ].includes(node.type),
  );

  if (!mdTree) {
    return [];
  }

  const sectionTrees = splitTreeBy(mdTree, (node) => node.type === 'heading');
  return sectionTrees.map((tree) => toMarkdown(tree));
};

const splitMarkdocIntoSections = (content: string): string[] => {
  const ast = Markdoc.parse(content);
  // In Markdoc, we make an exception and transform {% img %}
  // and {% image %} tags to <img> html since this is a common
  // use as an improvement to the ![]() Markdown tag. We could
  // offer to pass such rules via the API call.
  const transformed = Markdoc.transform(ast, {
    tags: {
      img: { render: 'img', attributes: { src: { type: String } } },
      image: { render: 'img', attributes: { src: { type: String } } },
    },
  });
  const html = Markdoc.renderers.html(transformed) || '';
  const md = turndown.turndown(html);
  return splitMarkdownIntoSections(md, false);
};

const splitHtmlIntoSections = (content: string): string[] => {
  const md = turndown.turndown(content);
  return splitMarkdownIntoSections(md, false);
};

const TOKEN_CUTOFF_ADJUSTED = CONTEXT_TOKENS_CUTOFF * 0.8;

const splitWithinTokenCutoff = (section: string): string[] => {
  // GPT3Tokenizer is slow, especially on large text. Use the approximated
  // value instead (1 token ~= 4 characters), and add a little extra
  // buffer.
  if (section.length / 4 < TOKEN_CUTOFF_ADJUSTED) {
    return [section];
  }

  const subSections: string[] = [];
  const lines = section.split('\n');
  let accTokenCounter = 0;
  let accLines = '';

  const i = 0;
  for (const line of lines) {
    const lineTokenCount = line.length / 4;
    if (accTokenCounter + lineTokenCount < TOKEN_CUTOFF_ADJUSTED) {
      accLines = accLines + '\n' + line;
      accTokenCounter = accTokenCounter + lineTokenCount;
    } else {
      subSections.push(accLines);
      accLines = line;
      accTokenCounter = 0;
    }
  }

  if (accLines) {
    subSections.push(accLines);
  }

  return subSections;
};

const processFile = (file: FileData): FileSectionData => {
  let sections: string[] = [];
  const meta = extractFrontmatter(file.content);
  const fileType = getFileType(file.name);
  if (fileType === 'mdoc') {
    sections = splitMarkdocIntoSections(file.content);
  } else if (fileType === 'html') {
    sections = splitHtmlIntoSections(file.content);
  } else {
    try {
      sections = splitMarkdownIntoSections(file.content, true);
    } catch (e) {
      // Some repos use the .md extension for Markdoc, and this
      // would break if parsed as MDX, so attempt with Markoc
      // parsing here.
      sections = splitMarkdocIntoSections(file.content);
    }
  }

  // Now that we have sections, break them up further to stay within
  // the token limit. This is especially important for plain text files
  // with no heading separators, or Markdown files with very
  // large sections. We don't want these to be ignored.
  const trimmedSections = sections.reduce((acc: string[], value: string) => {
    const subsections = splitWithinTokenCutoff(value);
    return [...acc, ...subsections];
  }, [] as string[]);
  return { sections: trimmedSections, meta };
};

const getFileAtPath = async (
  supabase: SupabaseClient,
  sourceId: Source['id'],
  path: string,
): Promise<DbFile['id'] | undefined> => {
  const { data, error } = await supabase
    .from('files')
    .select('id')
    .match({ source_id: sourceId, path })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error('Error:', error);
    return undefined;
  }
  return data?.id as DbFile['id'];
};

const createFile = async (
  supabase: SupabaseClient,
  // TODO: remove once migration is safely completed. We set an explicit
  // value to prevent NULL values, because if a row has a NULL value,
  // somehow it won't be returned in the inner joined filter query.
  _projectId: Project['id'],
  sourceId: Source['id'],
  path: string,
  meta: any,
  checksum: string,
): Promise<DbFile['id'] | undefined> => {
  const { error, data } = await supabase
    .from('files')
    .insert([
      { source_id: sourceId, project_id: _projectId, path, meta, checksum },
    ])
    .select('id')
    .limit(1)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data?.id as DbFile['id'];
};

export const generateFileEmbeddings = async (
  supabaseAdmin: SupabaseClient,
  _projectId: Project['id'],
  sourceId: Source['id'],
  file: FileData,
  byoOpenAIKey: string | undefined,
) => {
  let embeddingsTokenCount = 0;
  const errors: { path: string; message: string }[] = [];

  const projectId = await getProjectIdFromSource(supabaseAdmin, sourceId);

  if (!projectId) {
    return;
  }

  const { meta, sections } = processFile(file);

  let fileId = await getFileAtPath(supabaseAdmin, sourceId, file.path);

  const checksum = createChecksum(file.content);

  // Delete previous file section data, and update current file
  if (fileId) {
    await supabaseAdmin
      .from('file_sections')
      .delete()
      .filter('file_id', 'eq', fileId);
    await supabaseAdmin
      .from('files')
      .update({ meta, checksum })
      .eq('id', fileId);
  } else {
    fileId = await createFile(
      supabaseAdmin,
      _projectId,
      sourceId,
      file.path,
      meta,
      checksum,
    );
  }

  if (!fileId) {
    return [
      { path: file.path, message: `Unable to create file ${file.path}.` },
    ];
  }

  const embeddingsData: {
    file_id: DbFile['id'];
    content: string;
    embedding: unknown;
    token_count: number;
  }[] = [];

  const model: OpenAIModelIdWithType = {
    type: 'embeddings',
    value: 'text-embedding-ada-002',
  };

  for (const section of sections) {
    const input = section.replace(/\n/g, ' ');

    // Ignore content shorter than `MIN_CONTENT_LENGTH` characters.
    if (input.length < MIN_CONTENT_LENGTH) {
      continue;
    }

    try {
      // Retry with exponential backoff in case of error. Typical cause is
      // too_many_requests.
      const embeddingResult = await backOff(
        () => createEmbedding(input, byoOpenAIKey, model.value),
        {
          startingDelay: 10000,
          numOfAttempts: 10,
        },
      );

      embeddingsTokenCount += embeddingResult.usage?.total_tokens ?? 0;
      embeddingsData.push({
        file_id: fileId,
        content: input,
        embedding: embeddingResult.data[0].embedding,
        token_count: embeddingResult.usage.total_tokens ?? 0,
      });
    } catch (error) {
      const snippet = input.slice(0, 20);
      console.error('Error', error);
      errors.push({
        path: file.path,
        message: `Unable to generate embeddings for section starting with '${snippet}...': ${error}`,
      });
    }
  }

  const { error } = await supabaseAdmin
    .from('file_sections')
    .insert(embeddingsData);
  if (error) {
    console.error('Error storing embeddings:', error);
    errors.push({
      path: file.path,
      message: `Error storing embeddings: ${error.message}`,
    });
    // Too large? Attempt one embedding at a time.
    for (const data of embeddingsData) {
      await supabaseAdmin.from('file_sections').insert([data]);
    }
  }

  await recordProjectTokenCount(
    projectId,
    geLLMInfoFromModel(model),
    embeddingsTokenCount,
  );

  return errors;
};
