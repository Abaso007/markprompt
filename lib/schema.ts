import Ajv, { JTDSchemaType } from 'ajv/dist/jtd';

import { MarkdownProcessorOptions, MarkpromptConfig } from '@/types/types';

export const MARKPROMPT_CONFIG_SCHEMA: JTDSchemaType<MarkpromptConfig> = {
  optionalProperties: {
    include: { elements: { type: 'string' } },
    exclude: { elements: { type: 'string' } },
    processorOptions: {
      optionalProperties: {
        linkRewrite: {
          properties: {
            rules: {
              elements: {
                properties: {
                  pattern: { type: 'string' },
                  replace: { type: 'string' },
                },
              },
            },
          },
          optionalProperties: {
            excludeExternalLinks: { type: 'boolean' },
          },
        },
        imageSourceRewrite: {
          properties: {
            rules: {
              elements: {
                properties: {
                  pattern: { type: 'string' },
                  replace: { type: 'string' },
                },
              },
            },
          },
          optionalProperties: {
            excludeExternalLinks: { type: 'boolean' },
          },
        },
      },
    },
  },
};

export const MARKPROMPT_CONFIG_PROCESSOR_OPTIONS_SCHEMA: JTDSchemaType<MarkdownProcessorOptions> =
  {
    optionalProperties: {
      linkRewrite: {
        properties: {
          rules: {
            elements: {
              properties: {
                pattern: { type: 'string' },
                replace: { type: 'string' },
              },
            },
          },
        },
        optionalProperties: {
          excludeExternalLinks: { type: 'boolean' },
        },
      },
      imageSourceRewrite: {
        properties: {
          rules: {
            elements: {
              properties: {
                pattern: { type: 'string' },
                replace: { type: 'string' },
              },
            },
          },
        },
        optionalProperties: {
          excludeExternalLinks: { type: 'boolean' },
        },
      },
    },
  };

const ajv = new Ajv();

export const parse = ajv.compileParser(MARKPROMPT_CONFIG_SCHEMA);

export const parseProcessorOptions = ajv.compileParser(
  MARKPROMPT_CONFIG_PROCESSOR_OPTIONS_SCHEMA,
);
