'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
        { href: '/projects', label: 'Projects', icon: '📁' },
        { href: '/manage-papers', label: 'Papers', icon: '📄' },
    ];

    return (
        <aside className="w-64 bg-white border-r border-border fixed h-screen hidden md:flex flex-col z-10">
            <Link href="/dashboard" className="px-6 py-5 text-lg font-bold text-text no-underline">
                Research Hub
            </Link>

            <nav className="flex-1 py-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-6 py-3 no-underline transition-all duration-200 ${isActive
                                ? 'border-r-2 font-medium bg-accent-glow text-accent border-accent'
                                : 'text-text-secondary hover:bg-bg-subtle hover:text-text'
                                }`}
                        >
                            <span className="text-base">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-border flex flex-col gap-2 text-sm text-text-secondary">
                <Link href="/" className="no-underline transition-colors hover:text-accent">
                    ← View public site
                </Link>
                <form action="/api/auth?action=logout" method="POST">
                    <button type="submit" className="bg-transparent border-none p-0 text-inherit font-inherit cursor-pointer hover:text-accent">
                        Log out
                    </button>
                </form>
            </div>
        </aside>
    );
}
