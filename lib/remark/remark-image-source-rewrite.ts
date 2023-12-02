import type { Root } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

import { RemarkImageSourceRewriteOptions } from '@/types/types';

const EXTERNAL_URL_REGEX = /^https?:\/\//;

export const remarkImageSourceRewrite: Plugin<
  [RemarkImageSourceRewriteOptions],
  Root
> = ({ rules, excludeExternalLinks }) => {
  return (tree, _file, done) => {
    visit(tree, 'image', (node) => {
      if (!(excludeExternalLinks && EXTERNAL_URL_REGEX.test(node.url))) {
        let newUrl = node.url;
        for (const rule of rules) {
          const re = new RegExp(rule.pattern);
          newUrl = newUrl.replace(re, rule.replace);
        }
        node.url = newUrl;
      }
    });
    done();
  };
};
