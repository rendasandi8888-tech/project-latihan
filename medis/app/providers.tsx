'use client';

import { ThirdwebProvider } from 'thirdweb/react';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThirdwebProvider>
      {children}
    </ThirdwebProvider>
  );
}
