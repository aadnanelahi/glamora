import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  const isValid = locale && routing.locales.includes(locale as 'en' | 'ar');
  if (!isValid) {
    locale = routing.defaultLocale;
  }

  return {
    locale: locale as 'en' | 'ar',
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
