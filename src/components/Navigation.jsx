'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './navigation.scss';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav>
      <ul>
        <li>
          <Link href="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
        </li>
        <li>
          <Link href="/search" className={pathname === '/search' ? 'active' : ''}>Search</Link>
        </li>
        <li>
          <Link href="/collections" className={pathname === '/collections' ? 'active' : ''}>Collections</Link>
        </li>
        <li>
          <Link href="/about" className={pathname === '/about' ? 'active' : ''}>About</Link>
        </li>
      </ul>
    </nav>
  );
}