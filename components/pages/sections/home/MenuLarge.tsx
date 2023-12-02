import { useSession } from '@supabase/auth-helpers-react';
import cn from 'classnames';
import Link from 'next/link';

import { GitHubIcon } from '@/components/icons/GitHub';
import { MarkpromptIcon } from '@/components/icons/Markprompt';
import { XIcon } from '@/components/icons/X';
import { useContactDialogContext } from '@/lib/context/contact-dialog';

export const MenuLarge = ({ animated }: { animated?: boolean }) => {
  const session = useSession();
  const { setContactDialogOpen } = useContactDialogContext();

  return (
    <div
      className={cn(
        'absolute inset-x-0 top-0 z-10 flex justify-center py-4 px-6 sm:px-8 md:py-6',
        {
          'fade-in-slide-down': animated,
        },
      )}
    >
      <div className="flex w-full max-w-screen-lg flex-row items-center gap-2 sm:gap-2">
        <Link
          href="/"
          className="home-with-ring -ml-1 flex flex-none flex-row items-center gap-3 rounded-md p-1 text-sm text-white"
        >
          <MarkpromptIcon className="mx-auto w-10" />
          <span className="font-medium tracking-wide">Markprompt</span>
        </Link>
        <div className="flex-grow" />
        <Link
          className="home-ghost-button hidden flex-none md:block"
          href="/integrations"
        >
          Integrations
        </Link>
        <Link
          className="home-ghost-button hidden flex-none lg:block"
          href="/templates"
        >
          Templates
        </Link>
        {/* <Link
          className="home-ghost-button hidden flex-none sm:block"
          href="/pricing"
        >
          Pricing
        </Link> */}
        <Link
          className="home-ghost-button hidden flex-none sm:block"
          href="/blog"
        >
          Blog
        </Link>
        <Link
          className="home-ghost-button hidden flex-none sm:block"
          href="/docs"
        >
          Docs
        </Link>
        <Link
          className="home-ghost-button hidden flex-none sm:block"
          href="/about"
        >
          About
        </Link>
        <button
          className="home-ghost-button hidden flex-none cursor-pointer outline-none sm:block"
          onClick={() => {
            setContactDialogOpen(true);
          }}
        >
          Contact us
        </button>
        {session ? (
          <Link
            className="home-ghost-button mx-2 flex-none select-none"
            data-highlighted="true"
            href="/"
          >
            Go to app
          </Link>
        ) : (
          <Link
            className="home-ghost-button flex-none select-none"
            href="/login"
          >
            Sign in
          </Link>
        )}
        <a
          className="home-icon-button hidden md:block"
          href="https://github.com/motifland/markprompt"
          aria-label="Markprompt on GitHub"
          target="_blank"
          rel="noreferrer"
        >
          <GitHubIcon className="h-5 w-5" />
        </a>
        <a
          className="home-icon-button"
          href="https://x.com/markprompt"
          aria-label="Follow Markprompt on Twitter"
          target="_blank"
          rel="noreferrer"
        >
          <XIcon className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
};
