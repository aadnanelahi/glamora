import type { Metadata } from 'next';
import { getLocale, getMessages } from 'next-intl/server';
import Providers from '@/components/shared/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Glamora — Salon & Spa Management Platform',
  description: 'Multi-tenant SaaS platform for beauty salons, spas, and barbershops',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const isRtl = locale === 'ar';

  return (
    <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'}>
      <body className={isRtl ? 'rtl' : 'ltr'}>
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
