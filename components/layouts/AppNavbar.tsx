import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import cn from 'classnames';
import { SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { FC } from 'react';

import { MarkpromptIcon } from '../icons/Markprompt';
import { TeamProjectPicker } from '../team/TeamProjectPicker';
import { DocsPrompt } from '../ui/DocsPrompt';
import { ContactWindow } from '../user/ChatWindow';
import ProfileMenu from '../user/ProfileMenu';

type AppNavbarProps = {
  animated?: boolean;
};

export const AppNavbar: FC<AppNavbarProps> = ({ animated }) => {
  return (
    <div
      className={cn(
        animated && 'animate-slide-down-delayed',
        'fixed inset-x-0 top-0 z-20 flex h-[var(--app-navbar-height)] flex-none flex-row items-center gap-4 border-b border-neutral-900 bg-neutral-1100 px-4',
      )}
    >
      <div className="flex-none">
        <Link href="/" className="outline-none">
          <MarkpromptIcon className="mx-auto h-8 w-8 text-white" />
        </Link>
      </div>
      <TeamProjectPicker />
      <div className="flex-grow" />
      <div className="flex flex-none items-center gap-4">
        <NavigationMenu.Root>
          <NavigationMenu.List className="flex flex-row items-center gap-2 px-2 py-1">
            <ContactWindow
              closeOnClickOutside
              Component={
                <NavigationMenu.Item>
                  <NavigationMenu.Link
                    asChild
                    className="button-ring block h-full rounded-md px-2 py-1.5 text-sm text-neutral-300 hover:bg-neutral-900 hover:text-neutral-100 focus-visible:text-neutral-100"
                  >
                    <button className="block h-full rounded-md px-2 py-1.5 text-sm text-neutral-300 hover:bg-neutral-900 hover:text-neutral-100 focus-visible:text-neutral-100">
                      Help
                    </button>
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
              }
            />
            <NavigationMenu.Item>
              <NavigationMenu.Link
                asChild
                className="button-ring block h-full rounded-md px-2 py-1.5 text-sm text-neutral-300 hover:bg-neutral-900 hover:text-neutral-100 focus-visible:text-neutral-100"
              >
                <a target="_blank" rel="noreferrer" href="/docs">
                  Docs
                </a>
              </NavigationMenu.Link>
            </NavigationMenu.Item>
            <NavigationMenu.Item>
              <DocsPrompt>
                <button
                  className="rounded-md p-2 outline-none transition duration-300 hover:bg-neutral-900"
                  role="button"
                  aria-label="Ask Markprompt"
                >
                  <div className="relative" aria-hidden="true">
                    <SearchIcon
                      className={cn(
                        'h-4 w-4 transform text-neutral-300 duration-300',
                      )}
                    />
                  </div>
                </button>
              </DocsPrompt>
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu.Root>
        <ProfileMenu />
      </div>
    </div>
  );
};
