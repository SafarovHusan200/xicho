'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider as NextSessionProvider } from 'next-auth/react';
import { useState } from 'react';

export default function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <NextSessionProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NextSessionProvider>
  );
}
