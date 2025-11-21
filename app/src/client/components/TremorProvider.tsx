import React, { ReactNode } from 'react';

// Create a simple provider component
const TremorProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

// Make sure to export TremorProvider as both named and default export
export { TremorProvider };
export default TremorProvider;