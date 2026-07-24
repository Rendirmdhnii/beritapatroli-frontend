'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  Menu, 
  X, 
  ChevronRight
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="w-full bg-white border-b-2 border-black font-sans">
      {/* ================= TINGKAT ATAS (TOP TIER: SOCIAL ICONS - GAGAH LOGO - SEARCH) ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-b border-gray-200">
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

          {/* Center Column: Official Logo Image (/lgberitapatroli.jpg) Gagah Size */}
          <div className="md:col-span-6 flex flex-col items-center justify-center text-center">
            <Link href="/" className="inline-block group">
              <img
                src="/lgberitapatroli.jpg"
                alt="Berita Patroli"
                className="h-16 sm:h-20 lg:h-24 w-auto max-h-24 object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </Link>
          </div>

          {/* Right Column: Search Form */}
          <div className="hidden md:flex md:col-span-3 items-center justify-end">
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Cari berita..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-14 py-2 text-xs bg-white border-2 border-black focus:outline-none focus:border-red-800 rounded-none font-sans"
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

      {/* ================= TINGKAT BAWAH (BOTTOM TIER: MERAH DARAH PEKAT BG-RED-800 CATEGORY BAR) ================= */}
      <nav className="bg-red-800 text-white sticky top-0 z-50 border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-13">
            
            {/* Desktop Category Menu Items (Expanded Rubrik) */}
            <ul className="hidden md:flex items-center space-x-1 text-xs font-bold uppercase tracking-wider h-full overflow-x-auto">
              <li>
                <Link
                  href="/"
                  className={`px-3.5 h-13 inline-flex items-center gap-2 transition uppercase font-bold tracking-wider border-b-4 ${
                    pathname === '/'
                      ? 'bg-red-950 text-white border-white'
                      : 'text-white border-transparent hover:border-white hover:bg-red-900'
                  }`}
                >
                  Beranda
                </Link>
              </li>
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = pathname === cat.href;
                return (
                  <li key={cat.name} className="h-full">
                    <Link
                      href={cat.href}
                      className={`px-3.5 h-13 inline-flex items-center gap-1.5 transition uppercase font-bold tracking-wider border-b-4 ${
                        isActive
                          ? 'bg-red-950 text-white border-white'
                          : 'text-white border-transparent hover:border-white hover:bg-red-900'
                      }`}
                    >
                      {Icon && <Icon className="w-3.5 h-3.5 opacity-90" />}
                      <span>{cat.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Mobile Bar Controls: Sosmed Icons + Hamburger Menu */}
            <div className="flex md:hidden items-center justify-between w-full h-12">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black text-red-200 uppercase tracking-wider font-mono mr-1">
                  IKUTI:
                </span>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="p-1.5 bg-black text-white hover:bg-red-950 transition"
                >
                  <FacebookIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="p-1.5 bg-black text-white hover:bg-red-950 transition"
                >
                  <TwitterIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="p-1.5 bg-black text-white hover:bg-red-950 transition"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="p-1.5 bg-black text-white hover:bg-red-950 transition"
                >
                  <YoutubeIcon className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-white hover:bg-red-900 transition-colors focus:outline-none flex items-center gap-1.5 text-xs font-black uppercase tracking-wider rounded-none"
                aria-label="Toggle Navigation Menu"
              >
                <span>{mobileMenuOpen ? 'Tutup' : 'Menu'}</span>
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Drawer Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-black text-white border-t-2 border-red-800 ${
            mobileMenuOpen ? 'max-h-[600px] opacity-100 py-3' : 'max-h-0 opacity-0 py-0'
          }`}
        >
          <div className="px-4 space-y-2">
            {/* Mobile Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative mb-3">
              <input
                type="text"
                placeholder="Cari berita..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-14 py-2 text-xs bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-red-800 rounded-none"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3 bg-red-800 text-white text-[10px] font-black uppercase tracking-wider rounded-none"
              >
                Cari
              </button>
            </form>

            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2 pt-1 font-mono">
              Kategori Berita
            </p>
            
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 text-xs font-bold uppercase tracking-wider border-b border-zinc-800 transition ${
                pathname === '/' ? 'bg-red-800 text-white' : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <span>Beranda</span>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </Link>

            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = pathname === cat.href;
              return (
                <Link
                  key={cat.name}
                  href={cat.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 text-xs font-bold uppercase tracking-wider border-b border-zinc-800 transition ${
                    isActive ? 'bg-red-800 text-white' : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {Icon && <Icon className="w-3.5 h-3.5 text-red-500" />}
                    <span>{cat.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
}
