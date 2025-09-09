import Navigation from '@/components/Navigation';
import OsuverseBackground from '@/components/OsuverseBackground';
import { AppProvider } from '@/context/AppContext';
import "./globals.scss";

export const metadata = {
  title: 'Osuverse',
  description: 'Osu! beatmaps collection manager'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning={true} className="app-body vsc-initialized">
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
