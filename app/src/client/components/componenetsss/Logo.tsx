import * as React from 'react';

export interface LogoProps extends React.SVGProps<SVGSVGElement> {
  /** Set either `size` (scales width & height) or explicit `width`/`height` */
  size?: number;                // defaults to 28 (width). height auto = size * 26/28
  title?: string;               // accessible title; if omitted, aria-hidden=true
  fromColor?: string;           // gradient start (default #025A94)
  toColor?: string;             // gradient end (default #00365A)
}

const Logo = React.forwardRef<SVGSVGElement, LogoProps>(function Logo(
  {
    size = 28,
    width,
    height,
    title,
    fromColor = '#025A94',
    toColor = '#00365A',
    className,
    style,
    ...rest
  },
  ref
) {
  const titleId = React.useId();
  const grad0 = React.useId();
  const grad1 = React.useId();

  // Maintain original aspect ratio (28 x 26) if only size provided
  const w = width ?? size;
  const h = height ?? (size * 26) / 28;

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={w}
      height={h}
      viewBox="0 0 28 26"
      fill="none"
      role="img"
      aria-labelledby={title ? titleId : undefined}
      aria-hidden={title ? undefined : true}
      className={className}
      style={style}
      {...rest}
    >
      {title ? <title id={titleId}>{title}</title> : null}

      <path
        d="M12.6655 0.311509C11.3948 0.674586 9.26169 3.791 8.354 5.30382C11.0771 6.89228 13.5732 10.75 16.0694 13.2461C18.5655 15.7423 19.4732 15.5154 20.8348 15.5154C21.924 15.5154 23.7091 14.6077 24.4656 14.1538C23.104 11.7333 19.9271 6.21152 18.1117 3.48844C15.8425 0.0845855 14.254 -0.142338 12.6655 0.311509Z"
        fill={`url(#${grad0})`}
      />
      <path
        d="M27.4156 20.5077C27.234 19.7815 25.7323 16.5361 25.3541 15.704C24.2649 16.7932 23.1797 17.822 22.4232 18.2002C16.9771 20.9232 11.7578 17.0656 8.58092 14.5694C6.03938 12.5725 5.04493 11.7707 4.51545 11.6194C4.21288 12.1489 2.54476 15.3338 1.09245 18.2385C-0.722932 21.8692 0.184761 23.4577 1.77322 24.3654C3.36169 25.2731 6.76554 25.5 12.8925 25.5H12.8925C19.0194 25.5 22.8771 25.5 25.3732 24.5923C27.8694 23.6846 27.6425 21.4154 27.4156 20.5077Z"
        fill={`url(#${grad1})`}
      />

      <defs>
        <linearGradient id={grad0} x1="26.2405" y1="25.5" x2="10.1367" y2="30.6469" gradientUnits="userSpaceOnUse">
          <stop stopColor={fromColor} />
          <stop offset="1" stopColor={toColor} />
        </linearGradient>
        <linearGradient id={grad1} x1="26.2405" y1="25.5" x2="10.1367" y2="30.6469" gradientUnits="userSpaceOnUse">
          <stop stopColor={fromColor} />
          <stop offset="1" stopColor={toColor} />
        </linearGradient>
      </defs>
    </svg>
  );
});

export default Logo;
