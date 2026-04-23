import type { Metadata, Viewport } from 'next';
import { Nunito } from 'next/font/google';
import AccessibilityApplier from '@/components/shared/AccessibilityApplier';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'GardenQuestSchool',
  description: 'A naturalist learning world.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#F5EBDC',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunito.variable}>
      <body>
        <AccessibilityApplier />
        {children}
      </body>
    </html>
  );
}
