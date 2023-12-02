import { describe, expect, it } from 'vitest';

import { htmlToMarkdown } from './html-to-markdown';

describe('html-to-markdown', () => {
  describe('htmlToMarkdown', () => {
    it('should remove all non-main tags', () => {
      expect(
        htmlToMarkdown(
          `<html>
          <head>
            <title>Title</title>
          </head>
          <body>
            <nav>
                Navigation
            </nav>
            <h1>Heading</h1>
          </body>
        </html>`,
          undefined,
          undefined,
        ),
      ).toStrictEqual('# Heading');
    });

    it('should convert to Markdown content', () => {
      expect(
        htmlToMarkdown('<h1>Heading</h1>', undefined, undefined),
      ).toStrictEqual('# Heading');
    });

    it('should target the include selector', () => {
      expect(
        htmlToMarkdown(
          '<main><h1>Heading</h1><div id="target">Target</div></main>',
          '#target',
          undefined,
        ),
      ).toStrictEqual('Target');
    });

    it('should target multiple include selectors', () => {
      expect(
        htmlToMarkdown(
          '<main><h1>Heading</h1><div id="target1">Target 1</div><div id="target2">Target 2</div></main>',
          '#target1,#target2',
          undefined,
        ),
      ).toStrictEqual('Target 1');
    });
    it('should exclude a target', () => {
      expect(
        htmlToMarkdown(
          `<main>
      <h1>Heading</h1>
      <div id="target1">Target 1</div>
      <div id="target2">Target 2</div>
    </main>`,
          undefined,
          '#target1',
        ),
      ).toStrictEqual('# Heading\n\nTarget 2');
    });

    const withTargetsHTML = `<main>
    <h1>Heading</h1>
    <div class="parent">
      <div id="target1">Target 1</div>
      <div id="target2">Target 2</div>
      <div id="target3">Target 3</div>
    </div>
  </main>`;

    it('should exclude multiple targets', () => {
      expect(
        htmlToMarkdown(withTargetsHTML, undefined, '#target1,#target3'),
      ).toStrictEqual('# Heading\n\nTarget 2');
    });

    it('should exclude targets with inclusion', () => {
      expect(
        htmlToMarkdown(withTargetsHTML, '.parent', '#target1,#target3'),
      ).toStrictEqual('Target 2');
    });

    it('should ignore exclude selectors that do not match anything', () => {
      expect(
        htmlToMarkdown(
          withTargetsHTML,
          '.parent',
          `$('#invalid-selector').parent(':has(*)')`,
        ),
      ).toStrictEqual('Target 1\n\nTarget 2\n\nTarget 3');
    });

    it('should ignore exclude selectors that do not match anything', () => {
      expect(
        htmlToMarkdown(withTargetsHTML, undefined, 'div:has(#target2)'),
      ).toStrictEqual('# Heading');
    });

    it('should apply scpecial Markdown transformation rules', () => {
      expect(
        htmlToMarkdown(
          `<main>
      <pre data-language="js">var i = 0</pre>
    </main>`,
          undefined,
          undefined,
        ),
      ).toStrictEqual('```js\nvar i = 0\n```');
      expect(
        htmlToMarkdown(
          `<main>
      <pre>var i = 0</pre>
    </main>`,
          undefined,
          undefined,
        ),
      ).toStrictEqual('```\nvar i = 0\n```');
    });

    it('should handle empty input', () => {
      expect(htmlToMarkdown('', undefined, undefined)).toEqual('');
    });
  });
});
