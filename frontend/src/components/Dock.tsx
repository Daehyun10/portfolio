'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/project', label: 'Project' },
  { href: '/about', label: 'About' },
];

export default function Dock() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-line bg-card px-1.5 py-1.5"
    >
      <ul className="flex items-center gap-0.5">
        {ITEMS.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`block rounded-full px-4 py-1.5 text-[13px] transition-colors duration-150 ${
                  active ? 'bg-fg text-bg' : 'text-muted hover:text-fg'
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
