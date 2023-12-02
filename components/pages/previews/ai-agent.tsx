import cn from 'classnames';

import { ColoredBlurs } from '@/components/ui/Blurs';

import { Button } from '../sections/home/shared';

export const AIAgent = ({
  withBlurs,
  noAnimation,
}: {
  withBlurs?: boolean;
  noAnimation?: boolean;
}) => {
  return (
    <div className="relative flex h-full w-full select-none flex-col justify-center bg-neutral-100 px-8 py-8 sm:px-12">
      {withBlurs && (
        <ColoredBlurs
          color1="lime"
          color2="sky"
          className="absolute inset-0 z-0 opacity-0 transition duration-500 group-hover:opacity-100"
          alt
        />
      )}
      <div
        className={cn(
          'z-10 w-[80%] transform place-self-end rounded-md bg-sky-500 px-3 py-2 text-xs text-white transition duration-500',
          {
            'group-hover:-translate-y-1': !noAnimation,
          },
        )}
      >
        Is there any way I can get a refund for the unused month of October?
      </div>
      {/* <div className="relative mt-2 flex flex-col gap-2 py-2 pl-4">
              <div className="absolute inset-y-0 left-[21px] z-0 w-1 border-l border-dashed border-neutral-200" />
              <div className="flex flex-row items-center gap-2">
                <div className="relative z-10 flex-none rounded-full bg-green-500 p-[3px]">
                  <Check
                    className="h-[5px] w-[5px] text-white"
                    strokeWidth={4}
                  />
                </div>
                <p className="text-[11px] text-neutral-500">
                  Checking eligibility for user robyn@globex.com...
                </p>
              </div>
              <div className="flex flex-row items-center gap-2">
                <div className="relative z-10 flex-none rounded-full bg-green-500 p-[3px]">
                  <Check
                    className="h-[5px] w-[5px] text-white"
                    strokeWidth={4}
                  />
                </div>
                <p className="text-[11px] text-neutral-500">
                  Eligibility confirmed.
                </p>
              </div>
            </div> */}
      <div className="z-10 flex transform flex-col justify-center">
        <div
          className={cn(
            'mt-4 w-[80%] place-self-start rounded-md bg-white px-3 py-2 text-xs text-neutral-900 transition delay-100 duration-500',
            {
              'group-hover:-translate-y-1': !noAnimation,
            },
          )}
        >
          Yes, you are eligible for a full refund for the month of October. Do
          you want to proceed with the refund?
        </div>
        <div
          className={cn(
            'mt-2 flex flex-row gap-1 transition delay-200 duration-500',
            {
              'group-hover:-translate-y-1': !noAnimation,
            },
          )}
        >
          <Button size="md" color="black">
            Yes, process my refund
          </Button>
          <Button size="md" color="whiteBordered">
            No
          </Button>
        </div>
      </div>
    </div>
  );
};
