import cn from 'classnames';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { FC, JSXElementConstructor, ReactNode } from 'react';

type FeatureCardProps = {
  Icon: JSXElementConstructor<any>;
  title: string;
  subtitle?: ReactNode;
  description?: string;
  href?: string;
  hrefLabel?: string;
  children?: ReactNode;
};

export const FeatureCard: FC<FeatureCardProps> = ({
  title,
  subtitle,
  description,
  href,
  hrefLabel,
  children,
}) => {
  const Comp = href ? (props: any) => <Link href={href} {...props} /> : 'div';
  return (
    <Comp
      className={cn(
        'group relative transform rounded-lg border border-dashed border-neutral-800 bg-neutral-1000 p-2 transition duration-300',
        {
          'hover:-translate-y-2': href,
        },
      )}
    >
      <div className="h-[360px] overflow-hidden rounded bg-neutral-900 shadow-lg sm:h-[300px]">
        {children}
      </div>
      <div className="not-prose relative z-10 flex flex-col gap-4 px-4 py-6 sm:py-8 sm:px-6">
        <h2 className="text-2xl font-semibold text-neutral-100">{title}</h2>
        {subtitle && <div className="text-sm text-neutral-300">{subtitle}</div>}
        <p className="text-neutral-400">{description}</p>
        {href && (
          <p className="mt-2 flex flex-none translate-y-2 transform flex-row items-center gap-1 text-sm font-medium text-sky-500 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            {hrefLabel}{' '}
            <ChevronRight className="mt-[1px] h-3.5 w-3.5" strokeWidth={3} />
          </p>
        )}
      </div>
    </Comp>
  );
};
