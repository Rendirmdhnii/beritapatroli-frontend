'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  Menu, 
  X, 
  Calendar, 
  ChevronRight
} from 'lucide-react';
import { categories } from '@/data/categories';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setCurrentDate(now.toLocaleDateString('id-ID', options));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="w-full bg-white border-b-2 border-black font-sans">
      {/* ================= TINGKAT ATAS (TOP TIER: DATE - GAGAH IMAGE LOGO - SEARCH) ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Left Column: Date Today */}
          <div className="hidden md:flex md:col-span-3 items-center gap-2 text-xs font-mono text-gray-700 uppercase tracking-wider">
            <div className="p-2 bg-red-800 text-white rounded-none">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Edisi Hari Ini</p>
              <p className="font-bold text-black">{currentDate || 'Sabtu, 25 Juli 2026'}</p>
            </div>
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
            
            {/* Desktop Category Menu Items */}
            <ul className="hidden md:flex items-center space-x-1 text-xs font-bold uppercase tracking-wider h-full">
              <li>
                <Link
                  href="/"
                  className={`px-4 h-13 inline-flex items-center gap-2 transition uppercase font-bold tracking-wider border-b-4 ${
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
                      className={`px-4 h-13 inline-flex items-center gap-1.5 transition uppercase font-bold tracking-wider border-b-4 ${
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

            {/* Mobile Bar Controls */}
            <div className="flex md:hidden items-center justify-between w-full h-12">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider font-mono">
                <Calendar className="w-3.5 h-3.5 text-red-300" />
                {currentDate || 'Sabtu, 25 Juli 2026'}
              </span>

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
            mobileMenuOpen ? 'max-h-[500px] opacity-100 py-3' : 'max-h-0 opacity-0 py-0'
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
