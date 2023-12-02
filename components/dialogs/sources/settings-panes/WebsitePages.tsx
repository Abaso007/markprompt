import {
  ErrorMessage,
  Field,
  Formik,
  FormikErrors,
  FormikValues,
} from 'formik';
import { FC, useCallback } from 'react';

import Button from '@/components/ui/Button';
import {
  ErrorLabel,
  FormField,
  FormHeading,
  FormHeadingGroup,
  FormLabel,
  FormRoot,
  FormSubHeading,
} from '@/components/ui/Forms';
import { NoAutoInput } from '@/components/ui/Input';
import { Note } from '@/components/ui/Note';
import { RecordEditor } from '@/components/ui/RecordEditor';
import { NoAutoTextArea } from '@/components/ui/TextArea';
import useSources from '@/lib/hooks/use-sources';
import { parseProcessorOptions } from '@/lib/schema';
import { capitalize } from '@/lib/utils';
import { toRegexpList } from '@/lib/utils.nodeps';
import {
  DbSource,
  NangoSourceDataType,
  Project,
  WebsitePagesSyncMetadata,
} from '@/types/types';

import { ProcessorOptions } from './ProcessorOptions';
import { updateSourceData } from './utils';

type WebsitePagesSettingsProps = {
  projectId: Project['id'];
  source: DbSource | undefined;
  forceDisabled?: boolean;
  onDidCompletedOrSkip?: () => void;
};

export const WebsitePagesSettings: FC<WebsitePagesSettingsProps> = ({
  projectId,
  source,
  forceDisabled,
  onDidCompletedOrSkip,
}) => {
  const { mutate: mutateSources, isNameAvailable } = useSources();

  const sourceData = source?.data as NangoSourceDataType | undefined;
  const syncMetadata = sourceData?.syncMetadata as
    | WebsitePagesSyncMetadata
    | undefined;

  const _updateSourceData = useCallback(
    async (
      newSourceData: Partial<NangoSourceDataType>,
      setSubmitting: (submitting: boolean) => void,
    ) => {
      await updateSourceData(
        projectId,
        source,
        syncMetadata,
        sourceData,
        newSourceData,
        setSubmitting,
        mutateSources,
        onDidCompletedOrSkip,
      );
    },
    [
      projectId,
      source,
      syncMetadata,
      sourceData,
      mutateSources,
      onDidCompletedOrSkip,
    ],
  );

  return (
    <>
      <Formik
        initialValues={{
          name: sourceData?.name || '',
        }}
        enableReinitialize
        validateOnMount
        validate={async (values) => {
          const errors: FormikErrors<FormikValues> = {};
          if (!values.name || values.name.trim().length === 0) {
            errors.name = 'Please enter a name';
          } else if (
            values.name !== sourceData?.name &&
            !isNameAvailable(values.name)
          ) {
            errors.name = 'This name is already taken';
          }

          return errors;
        }}
        onSubmit={async (values, { setSubmitting }) => {
          await _updateSourceData({ name: values.name }, setSubmitting);
        }}
      >
        {({ isSubmitting, isValid }) => (
          <FormRoot>
            <FormField>
              <FormLabel>Name</FormLabel>
              <Field
                className="flex-grow"
                type="text"
                name="name"
                inputSize="sm"
                as={NoAutoInput}
                disabled={isSubmitting || forceDisabled}
              />
              <ErrorMessage name="name" component={ErrorLabel} />
            </FormField>
            <Button
              className="place-self-start"
              disabled={!isValid || forceDisabled}
              loading={isSubmitting}
              variant="plain"
              buttonSize="sm"
              type="submit"
            >
              Save
            </Button>
          </FormRoot>
        )}
      </Formik>
      <div className="h-8" />
      <Formik
        initialValues={{
          includeRegexes: syncMetadata?.includeRegexes?.join('\n') || '',
          excludeRegexes: syncMetadata?.excludeRegexes?.join('\n') || '',
          requestHeaders: syncMetadata?.requestHeaders || [],
          includeSelectors: syncMetadata?.includeSelectors || '',
          excludeSelectors: syncMetadata?.excludeSelectors || '',
          processorOptions: syncMetadata?.processorOptions
            ? JSON.stringify(syncMetadata.processorOptions, null, 2)
            : '',
        }}
        enableReinitialize
        validateOnMount
        validate={async (values) => {
          const errors: FormikErrors<FormikValues> = {};
          if (values.processorOptions) {
            const parsedConfig = parseProcessorOptions(values.processorOptions);
            if (!parsedConfig && parseProcessorOptions.message) {
              errors.processorOptions = `${capitalize(
                parseProcessorOptions.message,
              )} at character ${parseProcessorOptions.position}.`;
            }
          }
          return errors;
        }}
        onSubmit={async (values, { setSubmitting }) => {
          const newSyncMetadata: Partial<WebsitePagesSyncMetadata> = {
            includeRegexes: toRegexpList(values.includeRegexes),
            excludeRegexes: toRegexpList(values.excludeRegexes),
            requestHeaders: values.requestHeaders,
            includeSelectors: values.includeSelectors,
            excludeSelectors: values.excludeSelectors,
            processorOptions: parseProcessorOptions(values.processorOptions),
          };
          await _updateSourceData(
            { syncMetadata: newSyncMetadata },
            setSubmitting,
          );
        }}
      >
        {({ values, isSubmitting, isValid, setFieldValue }) => {
          return (
            <FormRoot>
              <FormHeadingGroup>
                <FormHeading>URL configuration</FormHeading>
                <FormSubHeading learnMoreHref="https://en.wikipedia.org/wiki/Regular_expression">
                  Specify URL patterns to include and exclude, using regular
                  expressions. One per line.{' '}
                </FormSubHeading>
              </FormHeadingGroup>
              <FormField>
                <FormLabel>Include list</FormLabel>
                <Field
                  className="h-[100px] flex-grow font-mono text-xs"
                  type="text"
                  name="includeRegexes"
                  textAreaSize="sm"
                  placeholder={`Examples:\n\n\\/blog\\/.*$\n\\/docs\\/.*$`}
                  as={NoAutoTextArea}
                  disabled={isSubmitting || forceDisabled}
                />
                <ErrorMessage name="includeRegexes" component={ErrorLabel} />
              </FormField>
              <FormField>
                <FormLabel>Exclude list</FormLabel>
                <Field
                  className="h-[100px] flex-grow font-mono text-xs"
                  type="text"
                  name="excludeRegexes"
                  textAreaSize="sm"
                  placeholder={`Examples:\n\n\\/login$\n\\/files\\/.+\\.txt$`}
                  as={NoAutoTextArea}
                  disabled={isSubmitting || forceDisabled}
                />
                <ErrorMessage name="excludeRegexes" component={ErrorLabel} />
              </FormField>
              <Note size="sm" type="info">
                <a
                  className="subtle-underline"
                  href="https://chat.openai.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  ChatGPT
                </a>{' '}
                works great for generating regular expressions. Give it a few
                examples, and it will generate the right expressions that you
                can paste here.
              </Note>
              <FormHeadingGroup>
                <FormHeading>Request configuration</FormHeading>
                <FormSubHeading>
                  Specify header data to send alongside a request to your
                  website.
                </FormSubHeading>
              </FormHeadingGroup>
              <FormField>
                <FormLabel>Headers</FormLabel>
                <RecordEditor
                  records={values.requestHeaders || {}}
                  onRecordsChanged={(records) => {
                    setFieldValue('requestHeaders', records);
                  }}
                />
              </FormField>
              <FormHeadingGroup>
                <FormHeading>Content targets</FormHeading>
                <FormSubHeading>
                  Specify which parts of the page to include or exclude, using{' '}
                  <a
                    className="subtle-underline"
                    href="https://github.com/fb55/css-select/blob/master/README.md#supported-selectors"
                    rel="noreferrer"
                    target="_blank"
                  >
                    CSS selectors
                  </a>
                  . The full{' '}
                  <a
                    className="subtle-underline"
                    href="https://cheerio.js.org/docs/basics/selecting"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Cheerio syntax
                  </a>{' '}
                  is also supported.
                </FormSubHeading>
              </FormHeadingGroup>
              <FormField>
                <FormLabel>Include selector</FormLabel>
                <Field
                  className="flex-grow font-mono text-xs"
                  type="text"
                  name="includeSelectors"
                  inputSize="sm"
                  placeholder={'E.g. div.main-article-content'}
                  as={NoAutoInput}
                  disabled={isSubmitting || forceDisabled}
                />
              </FormField>
              <FormField>
                <FormLabel>Exclude selectors</FormLabel>
                <Field
                  className="flex-grow font-mono text-xs"
                  type="text"
                  name="excludeSelectors"
                  inputSize="sm"
                  placeholder={'E.g. #footer,.summary > blockquote'}
                  as={NoAutoInput}
                  disabled={isSubmitting || forceDisabled}
                />
              </FormField>
              <ProcessorOptions
                isSubmitting={isSubmitting}
                forceDisabled={forceDisabled}
              />
              <Button
                className="mt-4 flex-none self-start"
                disabled={!isValid || forceDisabled}
                loading={isSubmitting}
                variant="plain"
                buttonSize="sm"
                type="submit"
              >
                Save
              </Button>
            </FormRoot>
          );
        }}
      </Formik>
    </>
  );
};
