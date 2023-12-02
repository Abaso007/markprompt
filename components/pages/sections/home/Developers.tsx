import cn from 'classnames';
import Link from 'next/link';
import Balancer from 'react-wrap-balancer';

import { Code } from '@/components/ui/Code';

const BashComment = ({ comment }: { comment: string }) => {
  return (
    <div className="mb-0.5 flex flex-row items-start gap-2 font-mono text-[13px] text-neutral-600">
      <span className="flex-none select-none">#</span>
      <span>{comment}</span>
    </div>
  );
};

const BashCodeLine = ({ code }: { code: string }) => {
  return (
    <div className="flex flex-row items-start gap-2 text-[13px]">
      <span className="mt-[1px] flex-none select-none font-mono text-neutral-600">
        $
      </span>
      <Code noPreWrap className="flex-grow" language="bash" code={code} />
    </div>
  );
};

export const APITerminal = () => {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-md border border-neutral-900 bg-neutral-1000"
      style={{
        boxShadow: '20px -21px 44px -19px rgba(0,0,0,0.3)',
      }}
    >
      <div className="flex w-full flex-none flex-row gap-2 border-b border-neutral-900 px-4">
        <div className="flex flex-none flex-row gap-2 py-3.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
        </div>
        <div className="relative ml-4 flex w-24 items-center justify-center">
          ~
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-cyan-400" />
        </div>
      </div>
      <div className="flex flex-col p-4">
        <BashComment comment="Send content for training" />
        <BashCodeLine
          code={`curl https://api.markprompt.com/v1/train -X POST \\
  -H "Authorization: Bearer <TOKEN>" \\
  -F 'file=@./post.md'
`}
        />
        <BashComment comment="Generate chat response with citations" />
        <BashCodeLine
          code={`curl https://api.markprompt.com/v1/chat -X POST \\
  -H "Authorization: Bearer <TOKEN>" \\
  -d '{
    "messages": [{ "role": "user", "content": "How do I claim my credits?" }],
    "model": "gpt-4-32k"
  }'
`}
        />
        <BashComment comment="Fetch project insights" />
        <BashCodeLine
          code={`curl -X GET "https://api.markprompt.com/v1/insights/queries" \\
  -H "Authorization: Bearer <TOKEN>" \\
  -d '{ "from": "2023-09-01T22:00:00" }'`}
        />
      </div>
    </div>
  );
};

const reactCode = `import { Markprompt } from '@markprompt/react';
import { submitChat } from '@markprompt/core';

export default function CaseSubmissionForm(): ReactElement {
  return <Markprompt
      projectKey={process.env.NEXT_PUBLIC_PROJECT_KEY}
      chat={{
        systemPrompt:
          'You are a very enthusiastic company representative who loves to help people!',
      }}
    />
}`;

export const Editor = ({ className }: { className: string }) => {
  return (
    <div
      className={cn(
        className,
        'flex flex-col overflow-hidden rounded-md border border-[#08161D] bg-[#071014] p-4',
      )}
    >
      <Code
        noPreWrap
        showLineNumbers
        className="flex-grow text-xs opacity-50 transition duration-300 group-hover:opacity-100"
        language="tsx"
        code={reactCode}
      />
    </div>
  );
};

export const Developers = () => {
  return (
    <div className="relative bg-neutral-1100 pt-20 pb-32">
      <div className="relative z-10 mx-auto grid max-w-screen-xl grid-cols-1 px-8 md:grid-cols-2">
        <div className="flex flex-col items-start">
          <h1 className="pb-8 text-left text-4xl font-semibold text-neutral-100 sm:mt-20 sm:text-4xl md:-mr-8">
            <Balancer>Go deep with APIs</Balancer>
          </h1>
          <div className="sm:pr-16">
            <p className="col-start-1 text-lg text-neutral-500">
              Bring customer support to the next level by deeply integrating it
              into your product and across touch points. With our REST APIs,
              JavaScript libraries and headless React components, you can build
              customer support as an integral part of the user experience.
            </p>
          </div>
          <Link
            className="home-border-button mt-8 flex-none select-none justify-self-start whitespace-nowrap rounded-lg px-4 py-2 font-medium outline-none ring-sky-500 ring-offset-0 ring-offset-neutral-900 transition focus:ring"
            href="/docs"
          >
            Read the docs
          </Link>
        </div>
        <div className="skew group relative mt-40 sm:mt-20">
          <div className="relative z-20">
            <APITerminal />
          </div>
          <div className="absolute inset-0 z-0">
            <Editor className="h-full w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
