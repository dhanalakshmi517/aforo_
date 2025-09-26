// components/Brand/kong.tsx
import * as React from 'react';

export interface KongLogoProps extends React.SVGProps<SVGSVGElement> {
  /** Set either `size` (scales width & height) or explicit `width`/`height` */
  size?: number;                // defaults to 47 (width). height auto = size * 46/47
  title?: string;               // accessible title; if omitted, aria-hidden=true
  fromColor?: string;           // gradient start (default #14A06C)
  toColor?: string;             // gradient end (default #2578D1)
}

const Kong = React.forwardRef<SVGSVGElement, KongLogoProps>(function Kong(
  {
    size = 47,
    width,
    height,
    title,
    fromColor = '#14A06C',
    toColor = '#2578D1',
    className,
    style,
    ...rest
  },
  ref
) {
  const titleId = React.useId();
  const gid = React.useId();           // base to keep gradient IDs unique
  const g0 = `${gid}-g0`;
  const g1 = `${gid}-g1`;
  const g2 = `${gid}-g2`;
  const g3 = `${gid}-g3`;

  // Maintain original aspect ratio (47 x 46) if only size provided
  const w = width ?? size;
  const h = height ?? (size * 46) / 47;

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={w}
      height={h}
      viewBox="0 0 47 46"
      fill="none"
      role="img"
      aria-labelledby={title ? titleId : undefined}
      aria-hidden={title ? undefined : true}
      className={className}
      style={style}
      {...rest}
    >
      {title ? <title id={titleId}>{title}</title> : null}

      <path d="M4.97266 32.6851V39.29H10.6341L15.8237 32.2133H21.9569L23.8441 29.8543L16.7673 21.834L12.0494 26.0801H10.1623L4.97266 32.6851Z" fill={`url(#${g0})`} />
      <path d="M16.7673 34.1004L15.8237 35.044L17.7108 37.8747V39.29H25.2594L25.7312 37.8747L21.9569 34.1004H16.7673Z" fill={`url(#${g1})`} />
      <path d="M21.0133 15.7008L18.1826 20.4186L32.808 37.4029L32.3362 39.29H38.4694L39.8847 34.1004L24.3158 15.7008H21.0133Z" fill={`url(#${g2})`} />
      <path d="M23.3723 10.9829L21.4851 13.8137L21.9569 14.2854H25.2594L31.3926 20.8904L34.6951 18.0597V17.1162L33.7515 15.229V13.3419L27.1465 8.62402L23.3723 10.9829Z" fill={`url(#${g3})`} />

      <defs>
        <linearGradient id={g0} x1="33.2798" y1="14.2854" x2="6.38801" y2="37.8747" gradientUnits="userSpaceOnUse">
          <stop stopColor={fromColor} />
          <stop offset="1" stopColor={toColor} />
        </linearGradient>
        <linearGradient id={g1} x1="33.2798" y1="14.2854" x2="6.38801" y2="37.8747" gradientUnits="userSpaceOnUse">
          <stop stopColor={fromColor} />
          <stop offset="1" stopColor={toColor} />
        </linearGradient>
        <linearGradient id={g2} x1="33.2798" y1="14.2854" x2="6.38801" y2="37.8747" gradientUnits="userSpaceOnUse">
          <stop stopColor={fromColor} />
          <stop offset="1" stopColor={toColor} />
        </linearGradient>
        <linearGradient id={g3} x1="33.2798" y1="14.2854" x2="6.38801" y2="37.8747" gradientUnits="userSpaceOnUse">
          <stop stopColor={fromColor} />
          <stop offset="1" stopColor={toColor} />
        </linearGradient>
      </defs>
    </svg>
  );
});

export default Kong;
