'use client';

import { StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider } from 'antd';
import { NextIntlClientProvider } from 'next-intl';
import type { AbstractIntlMessages } from 'next-intl';

export default function Providers({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
}) {
  const isRtl = locale === 'ar';

  return (
    <StyleProvider>
      <ConfigProvider
        direction={isRtl ? 'rtl' : 'ltr'}
        theme={{
          token: {
            colorPrimary: '#4c6ef5',
            colorLink: '#4c6ef5',
            borderRadius: 8,
            fontFamily: isRtl
              ? "'Noto Sans Arabic', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              : "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          },
        }}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </ConfigProvider>
    </StyleProvider>
  );
}
