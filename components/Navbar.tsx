'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close mobile menu on route-level clicks (anchor links)
    const closeMobile = () => setMobileOpen(false);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-theme-bg/80 backdrop-blur-xl border-b border-theme-border-s shadow-lg shadow-black/20'
                    : 'bg-transparent'
            }`}
        >
            <div className="container-wide flex items-center justify-between h-16">
                {/* Brand */}
                <Link href="/" className="flex items-center gap-2 group" onClick={closeMobile}>
                    <div className="w-2 h-2 rounded-full bg-accent-400 group-hover:shadow-[0_0_8px_rgba(6,182,212,0.6)] transition-shadow"></div>
                    <span className="text-sm font-bold tracking-tight text-theme-text">DailyDesign</span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/#how-it-works" className="text-sm text-theme-muted hover:text-theme-text transition">
                        How It Works
                    </Link>
                    <Link href="/#samples" className="text-sm text-theme-muted hover:text-theme-text transition">
                        Samples
                    </Link>
                    <Link href="/#pricing" className="text-sm text-theme-muted hover:text-theme-text transition">
                        Pricing
                    </Link>
                    <ThemeToggle />
                    <Link
                        href="/#pricing"
                        className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-accent-600 text-white hover:bg-accent-500 transition-all hover:shadow-[0_0_16px_rgba(6,182,212,0.3)]"
                    >
                        Get Started
                    </Link>
                </div>

                {/* Mobile Hamburger */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden relative w-8 h-8 flex items-center justify-center text-theme-muted hover:text-theme-text transition"
                    aria-label="Toggle menu"
                >
                    <div className="flex flex-col gap-1.5">
                        <span className={`block w-5 h-px bg-current transition-all duration-200 ${mobileOpen ? 'rotate-45 translate-y-[3.5px]' : ''}`} />
                        <span className={`block w-5 h-px bg-current transition-all duration-200 ${mobileOpen ? '-rotate-45 -translate-y-[3.5px]' : ''}`} />
                    </div>
                </button>
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
                    mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div className="container-wide pb-6 pt-2 flex flex-col gap-1 bg-theme-bg/95 backdrop-blur-xl border-b border-theme-border-s">
                    <Link href="/#how-it-works" onClick={closeMobile} className="py-3 text-sm text-theme-muted hover:text-theme-text transition border-b border-theme-border-s">
                        How It Works
                    </Link>
                    <Link href="/#samples" onClick={closeMobile} className="py-3 text-sm text-theme-muted hover:text-theme-text transition border-b border-theme-border-s">
                        Samples
                    </Link>
                    <Link href="/#pricing" onClick={closeMobile} className="py-3 text-sm text-theme-muted hover:text-theme-text transition border-b border-theme-border-s">
                        Pricing
                    </Link>
                    <div className="py-3 flex items-center gap-3 border-b border-theme-border-s">
                        <span className="text-sm text-theme-muted">Theme</span>
                        <ThemeToggle />
                    </div>
                    <Link
                        href="/#pricing"
                        onClick={closeMobile}
                        className="mt-3 py-2.5 text-sm font-semibold rounded-lg bg-accent-600 text-white text-center hover:bg-accent-500 transition-all"
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </nav>
    );
}
