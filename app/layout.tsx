import type { Metadata, Viewport } from 'next';
import { Nunito, Fraunces } from 'next/font/google';
import AccessibilityApplier from '@/components/shared/AccessibilityApplier';
import AudioUnlocker from '@/components/shared/AudioUnlocker';
import SfxBinder from '@/components/shared/SfxBinder';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-nunito',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
});

export const metadata: Metadata = {
  title: 'Garden Quest School',
  description: 'A naturalist learning world for curious children.',
  applicationName: 'Garden Quest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Garden Quest',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5EBDC' },
    { media: '(prefers-color-scheme: dark)',  color: '#6B8E5A' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} ${fraunces.variable}`}>
      <body>
        <AccessibilityApplier />
        <AudioUnlocker />
        <SfxBinder />
        {children}
      </body>
    </html>
  );
}
