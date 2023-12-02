import Balancer from 'react-wrap-balancer';

import { useContactDialogContext } from '@/lib/context/contact-dialog';

export const Ready = () => {
  const { setContactDialogOpen } = useContactDialogContext();

  return (
    <div className="relative bg-neutral-1100 py-20">
      <div className="relative z-10 mx-auto grid max-w-screen-xl grid-cols-1 place-items-start gap-8 px-6 sm:px-8 md:grid-cols-2">
        <h1 className="text-left text-4xl font-semibold text-neutral-100 sm:text-4xl">
          <Balancer>Ready to close tickets faster?</Balancer>
        </h1>
        <p className="col-start-1 text-lg text-neutral-500">
          Give your customer support team the tools they need to automate the
          mundane, so they can focus on what matters: delighting customers.
        </p>
        <div className="col-start-1 flex flex-row items-center gap-4">
          <a
            className="select-none justify-self-start whitespace-nowrap rounded-lg border-0 bg-white px-5 py-3 font-medium text-neutral-900 outline-none ring-sky-500 ring-offset-0 ring-offset-neutral-900 transition hover:bg-white/80 focus:ring"
            href="https://calendly.com/markprompt/30min"
            target="_blank"
            rel="noreferrer"
          >
            Book a demo
          </a>
          <button
            className="cursor-pointer select-none justify-self-start rounded-lg border-0 px-5 py-3 font-medium text-neutral-300 outline-none ring-sky-500 ring-offset-0 ring-offset-neutral-900 transition hover:bg-white/5 focus:ring"
            onClick={() => setContactDialogOpen(true)}
          >
            Contact us
          </button>
        </div>
      </div>
    </div>
  );
};
