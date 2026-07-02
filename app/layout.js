import { Inter } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';
import { cookies } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

import Providers from './providers';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Hisobot tayyorlash',
  description:
    "Xavfli ishlab chiqarish ob'ektlarida o'rnatilgan texnik qurilmalarni texnik ko'rik va sinov lardan o'tkazish holatini monitoring qilish elektron platformasi",
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'ru';
  const messages = (await import(`../messages/${locale}.json`)).default;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} font-sans antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <Toaster />
            <NextTopLoader color="#3b82f6" showSpinner={false} />
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
