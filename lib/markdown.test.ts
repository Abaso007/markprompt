import { describe, expect, it } from 'vitest';

import { convertToMarkdown, markdownToFileSectionData } from './markdown';

const content = `---
title: Some title
---

# Heading

[A link](/blog/index.mdx) ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum. Donec in efficitur ipsum, in egestas mauris.

![Lorem](https://example.com/assets/image.jpg)

<img src="https://example.com/assets/image.jpg" />
`;

const contentTransformed = `---
title: Some title
---

# Heading

[A link](/blog/index) ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum. Donec in efficitur ipsum, in egestas mauris.

![Lorem](https://globex.com/image.jpg)

<img src="https://globex.com/image.jpg" />
`;

const options = {
  linkRewrite: {
    rules: [{ pattern: '\\.mdx?', replace: '' }],
  },
  imageSourceRewrite: {
    rules: [
      {
        pattern: '^https://example.com/assets',
        replace: 'https://globex.com',
      },
    ],
  },
};

describe('markdown', () => {
  describe('convertToMarkdown', () => {
    it('should convert to Markdown content', () => {
      expect(
        convertToMarkdown(content, 'md', undefined, undefined, options),
      ).toStrictEqual(
        convertToMarkdown(
          contentTransformed,
          'md',
          undefined,
          undefined,
          options,
        ),
      );
    });

    it('should convert remove JSX tags', () => {
      expect(
        convertToMarkdown(
          '# Heading\n\n<JSXTag />',
          'mdx',
          undefined,
          undefined,
          undefined,
        ),
      ).toStrictEqual('# Heading');
    });

    it('should remove frontmatter tags', () => {
      expect(
        convertToMarkdown(
          '---\ntitle: Some title\n---\n\n# Heading\n\n<JSXTag />',
          'md',
          undefined,
          undefined,
          undefined,
        ),
      ).toStrictEqual('# Heading');
    });

    it('should convert code blocks', () => {
      expect(
        convertToMarkdown(
          '<body><h1>Heading</h1><pre>var i = 0;</pre></body>',
          'html',
          undefined,
          undefined,
          undefined,
        ),
      ).toStrictEqual('# Heading\n\n```\nvar i = 0;\n```');
    });

    it('should target include selector', () => {
      expect(
        convertToMarkdown(
          '<body><h1>Heading 1</h1><div id="target"><h2 class="heading2">Heading 2</h2><p>Text</p></div><pre>var i = 0;</pre></body>',
          'html',
          '#target',
          undefined,
          undefined,
        ),
      ).toStrictEqual('## Heading 2\n\nText');
    });

    it('should target include selector and omit exclude selectors', () => {
      expect(
        convertToMarkdown(
          '<body><h1>Heading 1</h1><div id="target"><h2 class="heading2">Heading 2</h2><p>Text</p></div><pre>var i = 0;</pre></body>',
          'html',
          '#target',
          '.heading2',
          undefined,
        ),
      ).toStrictEqual('Text');
    });

    it('should remove superfluous content within an anchor', () => {
      expect(
        convertToMarkdown(
          '<a class="some-class" href="/link"><div class="class">Link</div></a>',
          'html',
          undefined,
          undefined,
          undefined,
        ),
      ).toStrictEqual('[Link](/link)');

      expect(
        convertToMarkdown(
          '<a href="/link"><img src="abc" /></a>',
          'html',
          undefined,
          undefined,
          undefined,
        ),
      ).toStrictEqual('[![](abc)](/link)');

      expect(
        convertToMarkdown(
          '<a href="/link"><h2>Heading</h2></a>',
          'html',
          undefined,
          undefined,
          undefined,
        ),
      ).toStrictEqual('## [Heading](/link)');
    });

    it('should transform tables', () => {
      expect(
        convertToMarkdown(
          `<table>
            <thead>
              <tr>
                <th>Column 1</th>
                <th>Column 2</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Row 1 Col 1</td>
                <td>Row 1 Col 2</td>
              </tr>
              <tr>
                <td>Row 2 Col 1</td>
                <td>Row 2 Col 2</td>
              </tr>
            </tbody>
          </table>`,
          'html',
          '',
          '',
          undefined,
        ),
      ).toStrictEqual(`| Column 1 | Column 2 |
| --- | --- |
| Row 1 Col 1 | Row 1 Col 2 |
| Row 2 Col 1 | Row 2 Col 2 |`);
    });
  });

  describe('markdownToFileSectionData', () => {
    it('should transform Markdown content', () => {
      expect(markdownToFileSectionData(content, false, options)).toStrictEqual(
        markdownToFileSectionData(contentTransformed, false, {}),
      );
    });
  });
});
