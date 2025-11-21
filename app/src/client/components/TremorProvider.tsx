import React, { ReactNode } from 'react';

interface TremorProviderProps {
  children: ReactNode;
}

const TremorProvider: React.FC<TremorProviderProps> = ({ children }) => {
  return <>{children}</>;
};

export default TremorProvider;
