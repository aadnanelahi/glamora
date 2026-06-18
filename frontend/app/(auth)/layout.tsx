import { useLocale } from 'next-intl';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-glamora-50 to-glamora-100 p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
