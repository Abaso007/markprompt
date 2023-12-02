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
  FormFootnote,
  FormHeading,
  FormHeadingGroup,
  FormLabel,
  FormRoot,
  FormSubHeading,
} from '@/components/ui/Forms';
import { NoAutoInput } from '@/components/ui/Input';
import { Note } from '@/components/ui/Note';
import { NoAutoTextArea } from '@/components/ui/TextArea';
import useSources from '@/lib/hooks/use-sources';
import { parseProcessorOptions } from '@/lib/schema';
import { capitalize, SUPPORTED_EXTENSIONS } from '@/lib/utils';
import { toRegexpList } from '@/lib/utils.nodeps';
import {
  DbSource,
  GitHubRepoSyncMetadata,
  NangoSourceDataType,
  Project,
} from '@/types/types';

import { ProcessorOptions } from './ProcessorOptions';
import { updateSourceData } from './utils';

type GitHubRepoSettingsProps = {
  projectId: Project['id'];
  source: DbSource | undefined;
  forceDisabled?: boolean;
  onDidCompletedOrSkip?: () => void;
};

export const GitHubRepoSettings: FC<GitHubRepoSettingsProps> = ({
  projectId,
  source,
  forceDisabled,
  onDidCompletedOrSkip,
}) => {
  const { mutate: mutateSources, isNameAvailable } = useSources();

  const sourceData = source?.data as NangoSourceDataType | undefined;
  const syncMetadata = sourceData?.syncMetadata as
    | GitHubRepoSyncMetadata
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
          name: (source?.data as NangoSourceDataType)?.name || '',
        }}
        enableReinitialize
        validateOnMount
        validate={async (values) => {
          const errors: FormikErrors<FormikValues> = {};
          if (!values.name || values.name.trim().length === 0) {
            errors.name = 'Please enter a name';
          } else if (
            values.name !== (source?.data as NangoSourceDataType).name &&
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
          branch: syncMetadata?.branch || '',
          includeRegexes: syncMetadata?.includeRegexes?.join('\n') || '',
          excludeRegexes: syncMetadata?.excludeRegexes?.join('\n') || '',
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
          const newSyncMetadata: Partial<GitHubRepoSyncMetadata> = {
            branch: values.branch,
            includeRegexes: toRegexpList(values.includeRegexes),
            excludeRegexes: toRegexpList(values.excludeRegexes),
            processorOptions: parseProcessorOptions(values.processorOptions),
          };
          await _updateSourceData(
            { syncMetadata: newSyncMetadata },
            setSubmitting,
          );
        }}
      >
        {({ isSubmitting, isValid }) => {
          return (
            <FormRoot>
              <FormHeadingGroup>
                <FormHeading>Repository settings</FormHeading>
              </FormHeadingGroup>
              <Note size="sm">
                Supported extensions:{' '}
                {SUPPORTED_EXTENSIONS.map((e, i) => {
                  return (
                    <span key={`supported-extension-${e}-${i}`}>
                      {i > 0 ? ', ' : ''}
                      <code className="text-xs">.{e}</code>
                    </span>
                  );
                })}
                . Files with other extensions will not be indexed.
              </Note>
              <FormField>
                <FormLabel>Branch</FormLabel>
                <Field
                  className="flex-grow"
                  type="text"
                  name="branch"
                  inputSize="sm"
                  as={NoAutoInput}
                  disabled={isSubmitting}
                />
                <FormFootnote>
                  Leave blank to use the repository&apos;s default branch.
                </FormFootnote>
              </FormField>
              <FormHeadingGroup>
                <FormHeading>Path configuration</FormHeading>
                <FormSubHeading learnMoreHref="https://en.wikipedia.org/wiki/Regular_expression">
                  Specify path patterns to include and exclude, using regular
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
                  placeholder={`Examples:\n\nblog\\/.*.md$\ndocs\\/.*.md$`}
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
                  placeholder={`Examples:\n\ndocs\\/legal.*`}
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
