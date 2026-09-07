'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider as NextSessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';
import DisplaySettingsEffect from '@/components/DisplaySettingsEffect';

export default function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <DisplaySettingsEffect />
      <NextSessionProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </NextSessionProvider>
    </ThemeProvider>
  );
}
