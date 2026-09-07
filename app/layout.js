import { Inter, Onest, Manrope, Montserrat } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';
import { cookies } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import Providers from './providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const onest = Onest({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-onest',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-montserrat',
  display: 'swap',
});

/* Applies persisted contrast/font-scale/font-family settings before first paint
   so the page doesn't flash back to defaults while zustand/persist rehydrates. */
const DISPLAY_SETTINGS_INIT_SCRIPT = `(function(){try{var r=JSON.parse(localStorage.getItem('display-settings'));var s=r&&r.state;if(!s)return;var el=document.documentElement;if(s.highContrast)el.classList.add('high-contrast');if(s.fontScale)el.style.setProperty('--font-scale',s.fontScale/100);var stacks={inter:'"Inter", "Inter Fallback", sans-serif',onest:'"Onest", "Onest Fallback", "Inter", "Inter Fallback", sans-serif',manrope:'"Manrope", "Manrope Fallback", "Inter", "Inter Fallback", sans-serif',montserrat:'"Montserrat", "Montserrat Fallback", "Inter", "Inter Fallback", sans-serif'};if(s.fontFamily&&stacks[s.fontFamily])el.style.setProperty('--app-font-family',stacks[s.fontFamily]);}catch(e){}})();`;

export const metadata = {
  title: 'ХИЧО',
  description:
    "Xavfli ishlab chiqarish ob'ektlarida o'rnatilgan texnik qurilmalarni texnik ko'rik va sinovlardan o'tkazish holatini monitoring qilish elektron platformasi",
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'ru';
  const messages = (await import(`../messages/${locale}.json`)).default;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${onest.variable} ${manrope.variable} ${montserrat.variable} font-sans antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: DISPLAY_SETTINGS_INIT_SCRIPT }} />
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
