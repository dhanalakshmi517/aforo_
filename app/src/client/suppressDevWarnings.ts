// Utility to filter out noisy warnings during development
// Specifically suppresses React Router v6 descendant <Routes> path warning
// and future-flag informational messages that clutter the console.

if (import.meta.env.MODE === 'development') {
  const originalWarn = console.warn;
  // List of substrings; any console.warn containing one of these will be skipped
  const SUPPRESSED = [
    'You rendered descendant <Routes>', // redundant after fix but still emitted by HMR cache
    'React Router Future Flag Warning', // info-only warnings
  ];
  console.warn = (...args: any[]) => {
    if (typeof args[0] === 'string' && SUPPRESSED.some(m => args[0].includes(m))) {
      return;
    }
    originalWarn.apply(console, args as any);
  };
}
