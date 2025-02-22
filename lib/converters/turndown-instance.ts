import TurndownService from 'turndown';

const getTurndownService = () => {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
  });

  turndownService.addRule('pre', {
    filter: 'pre',
    replacement: (content: string, node: any) => {
      const lang = node.getAttribute('data-language') || '';
      return `\n\n\`\`\`${lang}\n${content.trim()}\n\`\`\`\n\n`;
    },
  });

  return turndownService;
};

export const turndownService = getTurndownService();
