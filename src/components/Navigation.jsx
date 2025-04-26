'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav style={{ width: '200px', background: '#333', color: 'white', padding: '1rem' }}>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li style={{ marginBottom: '1rem' }}>
          <Link href="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
        </li>
        <li style={{ marginBottom: '1rem' }}>
          <Link href="/search" className={pathname === '/search' ? 'active' : ''}>Search</Link>
        </li>
        <li>
          <Link href="/collections" className={pathname === '/collections' ? 'active' : ''}>Collections</Link>
        </li>
        <li style={{ marginBottom: '1rem' }}>
          <Link href="/about" className={pathname === '/about' ? 'active' : ''}>About</Link>
        </li>
      </ul>
      <style jsx>{`
        nav {
          width: 200px;
          background: #333;
          color: white;
          padding: 1rem;
        }
        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        li {
          margin-bottom: 1rem;
        }
        li:last-child {
          margin-bottom: 0;
        }
        a {
          color: white;
          text-decoration: none;
          padding: 0.5rem;
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        a:hover {
          background-color: #444;
        }
        a.active {
          background-color: #555;
        }
      `}</style>
    </nav>
  );
}