'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Search
} from 'lucide-react';
import { categories } from '@/data/categories';

// Social Media Icons SVGs
function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      setSearchQuery('');
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <header className="w-full bg-white border-b-2 border-black font-sans">
      {/* ================= TINGKAT ATAS (TOP TIER: SOSMED - LOGO - SEARCH) ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Left Column: Deretan Ikon Sosmed di Header (Desktop) */}
          <div className="hidden md:flex md:col-span-3 items-center gap-2 text-xs font-mono uppercase tracking-wider">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">IKUTI KAMI:</span>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="p-2 bg-black text-white hover:bg-red-800 transition border border-black rounded-none"
            >
              <FacebookIcon className="w-4 h-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="p-2 bg-black text-white hover:bg-red-800 transition border border-black rounded-none"
            >
              <TwitterIcon className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-2 bg-black text-white hover:bg-red-800 transition border border-black rounded-none"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="p-2 bg-black text-white hover:bg-red-800 transition border border-black rounded-none"
            >
              <YoutubeIcon className="w-4 h-4" />
            </a>
          </div>

          {/* Center Column: Official Logo Image (/lgberitapatroli.jpg) */}
          <div className="md:col-span-6 flex flex-col items-center justify-center text-center">
            <Link href="/" className="inline-block group">
              <img
                src="/lgberitapatroli.jpg"
                alt="Berita Patroli"
                className="h-14 sm:h-20 lg:h-24 w-auto max-h-24 object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </Link>
          </div>

          {/* Right Column / Mobile Search Form */}
          <div className="md:col-span-3 flex items-center justify-center md:justify-end w-full">
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs sm:max-w-md md:max-w-xs">
              <input
                type="text"
                placeholder="Cari berita investigasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-16 py-2 text-xs bg-white border-2 border-black focus:outline-none focus:border-red-800 rounded-none font-sans text-black"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-2.5 top-2.5" />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3 bg-black hover:bg-red-800 text-white text-[10px] font-black uppercase tracking-wider rounded-none transition"
              >
                Cari
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* ================= TINGKAT BAWAH (MENU HORIZONTAL SWIPE DI HP & LAPTOP) ================= */}
      <nav className="bg-red-800 text-white sticky top-0 z-50 border-b-4 border-black">
        <div className="max-w-7xl mx-auto">
          {/* Scrollable Horizontal Category Bar (Swipeable di HP) */}
          <div className="flex items-center overflow-x-auto whitespace-nowrap no-scrollbar scrollbar-none px-2 sm:px-4 py-0">
            <Link
              href="/"
              className={`px-4 h-12 inline-flex items-center gap-2 transition uppercase font-black tracking-wider text-xs border-b-4 shrink-0 ${
                pathname === '/'
                  ? 'bg-red-950 text-white border-white'
                  : 'text-white border-transparent hover:border-white hover:bg-red-900'
              }`}
            >
              BERANDA
            </Link>
            {categories.map((cat) => {
              const isActive = pathname === cat.href;
              return (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className={`px-4 h-12 inline-flex items-center gap-1.5 transition uppercase font-black tracking-wider text-xs border-b-4 shrink-0 ${
                    isActive
                      ? 'bg-red-950 text-white border-white'
                      : 'text-white border-transparent hover:border-white hover:bg-red-900'
                  }`}
                >
                  <span>{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
}
