'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/library', label: 'Parts Library' },
  { href: '/scan', label: 'Scan' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/invoices', label: 'Invoices' },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1">
      {links.map(({ href, label }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`nav-link ${active ? 'active' : ''}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
