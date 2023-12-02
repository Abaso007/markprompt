import { FC, useMemo } from 'react';

import { GitHubIcon } from '../icons/GitHub';

type GitHubStarsButtonProps = {
  stars: number;
};

const formatNumStars = (stars: number) => {
  if (stars > 1000) {
    return `${(stars / 1000).toFixed(1)}k`;
  }
  return stars;
};

export const GitHubStarsButton: FC<GitHubStarsButtonProps> = ({ stars }) => {
  const numStars = useMemo(() => {
    return formatNumStars(stars);
  }, [stars]);

  return (
    <a
      className="home-button-ring group flex flex-row items-center gap-2 rounded-md border border-neutral-900 bg-neutral-1000 px-3 py-2 text-sm outline-none transition hover:bg-neutral-950"
      target="_blank"
      rel="noreferrer"
      aria-label={`Star on GitHub`}
      href="https://github.com/motifland/markprompt"
    >
      <GitHubIcon className="h-4 w-4 text-neutral-300" />
      <span className="font-medium text-neutral-300">Star on GitHub</span>
      <span aria-hidden="true" className="ml-2 text-neutral-500">
        {numStars}
      </span>
    </a>
  );
};
