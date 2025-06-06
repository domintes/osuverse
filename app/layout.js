import Navigation from '@/components/Navigation';
import OsuverseBackground from '@/components/OsuverseBackground';
import "./globals.scss";

export const metadata = {
  title: 'Osuverse',
  description: 'Osu! beatmaps collection manager'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className="app-body vsc-initialized">
        <OsuverseBackground />
        <Navigation />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
