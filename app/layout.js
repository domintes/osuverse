"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import "./globals.scss";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', height: '100vh' }}>
          <nav style={{ width: '200px', background: '#333', color: 'white', padding: '1rem' }}>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '1rem' }}><Link href="/">Home</Link></li>
              <li style={{ marginBottom: '1rem' }}><Link href="/about">About</Link></li>
              <li><Link href="/collections">Collections</Link></li>
            </ul>
          </nav>
          <main style={{ flex: 1, padding: '1rem' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
