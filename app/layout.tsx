import React from 'react';
import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import OsuverseBackground from '@/components/OsuverseBackground';
import { AppProvider } from '@/context/AppContext';
import './globals.scss';

export const metadata: Metadata = {
  title: 'Osuverse',
  description: 'Osu! beatmaps collection manager',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning={true} className="app-body vsc-initialized">
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const t = localStorage.getItem('themeColor') || 'purple'; document.documentElement.setAttribute('data-theme', t); } catch (e) {} })();`,
          }}
        />
        <AppProvider>
          <OsuverseBackground />
          <Navigation />
          <main>
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
