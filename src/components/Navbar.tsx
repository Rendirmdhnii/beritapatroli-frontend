'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Calendar, Menu, X } from 'lucide-react';
import { categories } from '@/data/categories';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const date = new Date();
    const formatted = date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    setCurrentDate(formatted);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      setSearchQuery('');
      setMobileMenuOpen(false);
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <header className="w-full bg-white font-sans border-b border-gray-200">
      {/* ================= 1. TOP HEADER BAR (TANGGAL - LOGO TENGAH - PENCARIAN) ================= */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Top Left: Edisi Hari Ini (Tanggal) */}
          <div className="hidden md:flex md:col-span-3 items-center gap-2 text-xs text-gray-600 font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#ff3c36]" />
            <span>
              <strong className="text-gray-900 font-bold">Edisi Hari Ini:</strong> {currentDate || 'Sabtu, 25 Juli 2026'}
            </span>
          </div>

          {/* Top Center: Logo Utama Berita Patroli */}
          <div className="md:col-span-6 flex flex-col items-center justify-center text-center">
            <Link href="/" className="inline-block">
              <img
                src="/lgberitapatroli.jpg"
                alt="Berita Patroli Logo"
                className="h-16 sm:h-20 max-h-24 w-auto object-contain mx-auto"
              />
            </Link>
            <p className="text-[11px] text-gray-500 font-semibold tracking-wider uppercase mt-1">
              Menyingkap Mafia Hukum &amp; Kriminal
            </p>
          </div>

          {/* Top Right: Form Pencarian Orisinal */}
          <div className="md:col-span-3 flex items-center justify-center md:justify-end w-full">
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Cari berita..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-10 py-1.5 text-xs bg-white border border-gray-300 focus:outline-none focus:border-[#ff3c36] text-gray-900 placeholder-gray-400"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 bottom-0 px-3 bg-[#ff3c36] hover:bg-black text-white transition flex items-center justify-center"
                aria-label="Cari"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* ================= 2. MAIN NAVIGATION BAR (MERAH KHAS #ff3c36) ================= */}
      <nav className="bg-[#ff3c36] text-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 text-white hover:bg-black/20 transition flex items-center gap-1 text-xs font-bold uppercase"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span>MENU</span>
          </button>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-1 overflow-x-auto whitespace-nowrap scrollbar-none py-0">
            <Link
              href="/"
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition ${
                pathname === '/'
                  ? 'bg-black text-white'
                  : 'text-white hover:bg-black/20'
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
                  className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition ${
                    isActive
                      ? 'bg-black text-white'
                      : 'text-white hover:bg-black/20'
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile Current Date Display (HP Only) */}
          <div className="md:hidden text-[10px] text-white font-medium">
            {currentDate}
          </div>

        </div>

        {/* Mobile Dropdown Menu (HP) */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#222222] border-t border-red-700 divide-y divide-zinc-800">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 text-xs font-bold uppercase tracking-wider ${
                pathname === '/' ? 'text-[#ff3c36] bg-zinc-900' : 'text-white hover:bg-zinc-800'
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
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 text-xs font-bold uppercase tracking-wider ${
                    isActive ? 'text-[#ff3c36] bg-zinc-900' : 'text-white hover:bg-zinc-800'
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </header>
  );
}
