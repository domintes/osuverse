import "./globals.scss";

export const metadata = {
  title: "Osuverse",
  description: "Create your osu! beatmaps universe",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
