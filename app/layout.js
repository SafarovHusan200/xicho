import { Inter } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';

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

export default function RootLayout({ children }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <Toaster />
          <NextTopLoader color="#e0d2d2" showSpinner={false} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
