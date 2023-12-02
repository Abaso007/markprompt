import { InferGetStaticPropsType } from 'next';
import Image from 'next/image';
import { FC } from 'react';

import { LandingLayout } from '@/components/layouts/LandingLayout';
import { LargeSection } from '@/components/layouts/Pages';
import { getIndexPageStaticProps } from '@/lib/pages';

export const getStaticProps = getIndexPageStaticProps;

const Page = () => {
  return (
    <>
      <LargeSection>
        <a
          className="mt-6 inline-block select-none place-self-start justify-self-start whitespace-nowrap rounded-lg border-0 bg-white px-5 py-2 font-medium text-neutral-900 outline-none ring-sky-500 ring-offset-0 ring-offset-neutral-900 transition hover:bg-white/80 focus:ring"
          aria-label="Install app"
          href="https://login.salesforce.com/packaging/installPackage.apexp?p0=04tHn000000uNmAIAU"
          target="_blank"
          rel="noreferrer"
        >
          Install app
        </a>
        <Image
          className="mx-auto mt-24 w-full rounded-lg"
          src="/static/images/guides/salesforce-draft-composer/screenshot.png"
          alt="Salesforce Draft Composer"
          width={1512}
          height={770}
        />
      </LargeSection>
      <LargeSection>
        <div className="prose prose-sm prose-invert mt-16 text-neutral-400">
          <h2>Installation</h2>
          <h3>Salesforce</h3>
          <ol>
            <li>
              Click on the{' '}
              <a
                href="https://login.salesforce.com/packaging/installPackage.apexp?p0=04tHn000000uNmAIAU"
                target="_blank"
                rel="noreferrer"
              >
                package installation link.
              </a>
            </li>
            <li>
              Sign into the organization in which you want to install the
              package.
            </li>
            <li>Select &ldquo;install for all users&rdquo;.</li>
            <li>Click install.</li>
            <li>
              Tick &ldquo;Yes, grant access to these third-party web
              sites&rdquo; and hit Continue.
            </li>
            <li>
              Go to Setup → Object Manager → Case → Lightning Record Pages and
              edit &ldquo;Default Case Page&rdquo;.
            </li>
            <li>
              Click on Activation → Assign as Org Default → Desktop and phone.
            </li>
            <li>Hit Next.</li>
            <li>Hit Save.</li>
            <li>
              Go to Setup → Custom Metadata Types. Find &ldquo;Markprompt
              Setting&rdquo; and click Manage Records.
            </li>
            <li>Find &ldquo;Markprompt Setting&rdquo; and click Edit.</li>
          </ol>
          <h3>Markprompt</h3>
          <ol>
            <li>Navigate to your Markprompt project settings.</li>
            <li>
              Find the &ldquo;Token&rdquo; section and copy the token, or
              generate a new one.
            </li>
          </ol>
          <h3>Salesforce</h3>
          <ol>
            <li>
              Back in Salesforce, paste the token to the &ldquo;Token&rdquo;
              settings field.
            </li>
            <li>Hit Save.</li>
            <li>Open a case, and select the Markprompt tab.</li>
            <li>Hit Generate Draft, then Copy to clipboard.</li>
            <li>Your AI generated draft is ready to be pasted!</li>
          </ol>
        </div>
      </LargeSection>
    </>
  );
};

const PageWithLayout: FC<
  InferGetStaticPropsType<typeof getIndexPageStaticProps>
> = ({ stars, status }) => {
  return (
    <LandingLayout
      // ogImage="https://markprompt.com/static/cover-integrations.png"
      pageTitle="Salesforce Case AI Drafts"
      heading="AI Draft Assistant for Salesforce Case"
      subheading="Automatically draft replies in Salesforce Case, based on the
      current conversation and connected data sources."
      stars={stars}
      status={status}
    >
      <Page />
    </LandingLayout>
  );
};

export default PageWithLayout;
