import { load } from 'cheerio';

import { turndownService } from './turndown-instance';

const htmlExcludeTags = [
  'head',
  'script',
  'style',
  'nav',
  'footer',
  'aside',
  'svg',
];

export const htmlToMarkdown = (
  htmlContent: string,
  includeSelectors: string | undefined,
  excludeSelectors: string | undefined,
) => {
  const $ = load(htmlContent);

  htmlExcludeTags.forEach((tag) => {
    try {
      $(tag).remove();
    } catch {
      // Do nothing
    }
  });

  const target = $(
    includeSelectors && includeSelectors.length > 0 ? includeSelectors : 'body',
  );

  try {
    if (excludeSelectors && excludeSelectors.length > 0) {
      target.find(excludeSelectors).remove();
    }
  } catch {
    // Cheerio throws in case of empty selection
  }

  return turndownService.turndown(target.html() || '');
};
