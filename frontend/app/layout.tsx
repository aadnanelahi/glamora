import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Glamora — Salon & Spa Management Platform',
  description: 'Multi-tenant SaaS platform for beauty salons, spas, and barbershops',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
