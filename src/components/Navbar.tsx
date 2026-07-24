'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  const router = useRouter();

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
    <header className="w-full bg-white border-b border-gray-200">
      {/* ================= TINGKAT ATAS (TOP TIER: DATE - OFFICIAL IMAGE LOGO - SEARCH) ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Left Column: Date Today */}
          <div className="hidden md:flex md:col-span-3 items-center gap-2 text-xs font-medium text-slate-600">
            <div className="p-1.5 bg-red-50 text-[#990000] border border-red-200 rounded-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Edisi Hari Ini</p>
              <p className="font-semibold text-slate-800">{currentDate || 'Jumat, 24 Juli 2026'}</p>
            </div>
          </div>

          {/* Center Column: Official Logo Image (/lgberitapatroli.jpg) */}
          <div className="md:col-span-6 flex flex-col items-center justify-center text-center">
            <Link href="/" className="inline-block group">
              <img
                src="/lgberitapatroli.jpg"
                alt="Berita Patroli"
                className="h-14 sm:h-18 lg:h-20 w-auto max-h-20 object-contain mx-auto transition-transform group-hover:scale-[1.02]"
              />
            </Link>
          </div>

          {/* Right Column: Search Form */}
          <div className="hidden md:flex md:col-span-3 items-center justify-end">
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Cari berita terkini..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-gray-300 focus:outline-hidden focus:border-[#990000] transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-2.5 bg-[#111111] hover:bg-[#990000] text-white text-[10px] font-bold uppercase transition"
              >
                Cari
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* ================= TINGKAT BAWAH (BOTTOM TIER: STICKY CRIMSON CATEGORY BAR) ================= */}
      <nav className="bg-[#990000] text-white sticky top-0 z-50 border-b border-[#7a0000] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            
            {/* Desktop Category Menu Items */}
            <ul className="hidden md:flex items-center space-x-1 text-xs font-semibold uppercase tracking-wider h-full">
              <li>
                <Link
                  href="/"
                  className={`px-4 h-12 inline-flex items-center gap-2 transition ${
                    pathname === '/'
                      ? 'bg-[#7a0000] text-white font-bold border-b-2 border-white'
                      : 'text-white/90 hover:bg-[#800000] hover:text-white'
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
                      className={`px-4 h-12 inline-flex items-center gap-1.5 transition ${
                        isActive
                          ? 'bg-[#7a0000] text-white font-bold border-b-2 border-white'
                          : 'text-white/90 hover:bg-[#800000] hover:text-white'
                      }`}
                    >
                      {Icon && <Icon className="w-3.5 h-3.5 opacity-90" />}
                      <span>{cat.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Mobile Bar Controls (Mobile Hamburger Button & Mobile Date) */}
            <div className="flex md:hidden items-center justify-between w-full h-12">
              <span className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-red-200" />
                {currentDate || 'Jumat, 24 Juli 2026'}
              </span>

              {/* Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-white hover:bg-[#7a0000] transition-colors focus:outline-hidden flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                aria-label="Toggle Navigation Menu"
              >
                <span>{mobileMenuOpen ? 'Tutup' : 'Menu'}</span>
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 transition-transform duration-300 rotate-90" />
                ) : (
                  <Menu className="w-5 h-5 transition-transform duration-300" />
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Drawer Menu (Mulus Animated Dropdown) */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-[#111111] text-white border-t border-zinc-800 ${
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
                className="w-full pl-9 pr-12 py-2 text-xs bg-zinc-900 border border-zinc-700 text-white focus:outline-hidden focus:border-[#990000]"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3 bg-[#990000] text-white text-[10px] font-bold uppercase"
              >
                Cari
              </button>
            </form>

            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 pt-1">
              Kategori Berita
            </p>
            
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 text-xs font-bold uppercase tracking-wider border-b border-zinc-800 transition ${
                pathname === '/' ? 'bg-[#990000] text-white' : 'text-zinc-300 hover:bg-zinc-800'
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
                    isActive ? 'bg-[#990000] text-white' : 'text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {Icon && <Icon className="w-3.5 h-3.5 text-red-400" />}
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
