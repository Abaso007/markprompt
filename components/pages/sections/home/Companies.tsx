import { AngelListIcon } from '@/components/icons/AngelList';
import { AwellIcon } from '@/components/icons/Awell';
import { CalIcon } from '@/components/icons/Cal';
import { FlexpaIcon } from '@/components/icons/Flexpa';
// import { MindbodyIcon } from '@/components/icons/Mindbody';
import { PlotlyIcon } from '@/components/icons/Plotly';
import { SemgrepIcon } from '@/components/icons/Semgrep';
import { SkeduloIcon } from '@/components/icons/Skedulo';
import { SourcegraphIcon } from '@/components/icons/Sourcegraph';
import { WalletconnectIcon } from '@/components/icons/Walletconnect';

const List = () => {
  return (
    <>
      <AwellIcon className="w-[100px] flex-none" />
      <SkeduloIcon className="-mt-1 w-[120px] flex-none" />
      <SemgrepIcon className="w-[130px] flex-none" />
      {/* <MindbodyIcon className="w-[130px] flex-none" /> */}
      <AngelListIcon className="w-[100px] flex-none" />
      <SourcegraphIcon className="-mt-1 w-[160px] flex-none" />
      <PlotlyIcon className="w-[120px] flex-none" />
      <CalIcon className="w-[100px] flex-none" />
      <FlexpaIcon className="mt-1 w-[100px] flex-none" />
      <WalletconnectIcon className="w-[180px] flex-none" />
    </>
  );
};

export const Companies = () => {
  return (
    <div>
      <p className="mb-4 px-6 text-center text-sm text-neutral-500 sm:px-8">
        Live with established enterprises and fast-growing startups
      </p>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-neutral-1100 to-neutral-1100/0 md:w-[300px] md:via-neutral-1100" />
        <div className="absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-neutral-1100 to-neutral-1100/0 md:w-[300px] md:via-neutral-1100" />
        <div className="relative h-20 w-full max-w-full px-8 text-neutral-400">
          <div className="infinite-horizontal-scroll absolute inset-y-0 z-0 flex flex-row items-center justify-start gap-x-12 sm:gap-x-20">
            <List />
            <List />
            <List />
            <List />
          </div>
        </div>
      </div>
    </div>
  );
};
