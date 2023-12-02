import { FC } from 'react';

type ConfluenceIconProps = {
  className?: string;
};

export const ConfluenceIcon: FC<ConfluenceIconProps> = ({ className }) => {
  return (
    <svg viewBox="0 0 348 348" className={className}>
      <path
        d="M12.618 262.274c-3.599 5.87-7.641 12.681-11.074 18.107a11.075 11.075 0 003.71 15.061l71.984 44.298a11.069 11.069 0 0012.41-.524 11.085 11.085 0 002.928-3.241c2.88-4.817 6.59-11.074 10.632-17.774 28.517-47.067 57.2-41.308 108.917-16.612l71.376 33.943a11.063 11.063 0 008.618.381 11.06 11.06 0 003.738-2.323 11.057 11.057 0 002.539-3.595l34.275-77.522a11.073 11.073 0 00-5.537-14.507c-15.061-7.088-45.018-21.208-71.984-34.22-97.013-47.122-179.462-44.077-242.532 58.528z"
        fill="currentColor"
      />
      <path
        d="M335.381 86.355c3.6-5.87 7.642-12.68 11.075-18.106a11.074 11.074 0 00-3.71-15.062L270.762 8.89a11.075 11.075 0 00-15.781 3.655c-2.88 4.817-6.59 11.074-10.632 17.774-28.517 47.067-57.2 41.308-108.918 16.612L64.278 13.153a11.073 11.073 0 00-14.896 5.537L15.107 96.212a11.076 11.076 0 005.537 14.507c15.061 7.088 45.018 21.208 71.984 34.22 97.234 47.067 179.684 43.911 242.753-58.584z"
        fill="currentColor"
      />
      <defs>
        <linearGradient
          id="prefix__paint0_linear_8546_649"
          x1={330.733}
          y1={362.609}
          x2={112.953}
          y2={237.467}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset={0.18} stopColor="color(display-p3 0 .3216 .8)" />
          <stop offset={1} stopColor="color(display-p3 .149 .5176 1)" />
        </linearGradient>
        <linearGradient
          id="prefix__paint1_linear_8546_649"
          x1={17.266}
          y1={-14.035}
          x2={235.102}
          y2={111.162}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset={0.18} stopColor="color(display-p3 0 .3216 .8)" />
          <stop offset={1} stopColor="color(display-p3 .149 .5176 1)" />
        </linearGradient>
      </defs>
    </svg>
  );
};
