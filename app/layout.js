import Navigation from '@/components/Navigation';
import "./globals.scss";

export const metadata = {
  title: 'Osuverse',
  description: 'Osu! beatmaps collection manager'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="app-body vsc-initialized">
          <Navigation />
          <main style={{ flex: 1, padding: '1rem' }}>
            {children}
          </main>
      </body>
    </html>
  );
}
