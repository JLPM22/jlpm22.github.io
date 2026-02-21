'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    const pathname = usePathname();

    // Show button when page is scrolled down
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 200) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility, { passive: true });

        // Initial check in case they navigate directly to a scrolled position
        toggleVisibility();

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, [pathname]);

    // Smooth scroll to top
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className={`fixed bottom-6 right-6 p-3 rounded-full bg-accent text-white shadow-lg hover:bg-emerald-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 z-[9999] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
                }`}
        >
            <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
            </svg>
        </button>
    );
}
