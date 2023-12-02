/* eslint-disable @typescript-eslint/no-explicit-any */
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const getTurndownService = () => {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
  });

  turndownService.use(gfm);

  turndownService.addRule('pre', {
    filter: 'pre',
    replacement: (content: string, node: any) => {
      const lang = node.getAttribute('data-language') || '';
      return `\n\n\`\`\`${lang}\n${content.trim()}\n\`\`\`\n\n`;
    },
  });

  turndownService.addRule('anchor', {
    filter: 'a',
    replacement: function (content, node: any) {
      if (!content) {
        return '';
      }

      const href = node.getAttribute('href');
      const sanitizedContent = content.replace(/\n+/gi, ' ').trim();
      const match = sanitizedContent.match(/^(#+)\s(.*)/);
      if (match) {
        return `${match[1]} [${match[2]}](${href})`;
      }
      return `[${sanitizedContent}](${href})`;
    },
  });

  return turndownService;
};

export const turndownService = getTurndownService();
