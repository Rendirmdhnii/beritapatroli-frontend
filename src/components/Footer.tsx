import React from 'react';
import Link from 'next/link';
import { ShieldAlert, Mail, Phone, MapPin } from 'lucide-react';
import { categories } from '@/data/categories';

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-zinc-400 border-t-2 border-[#990000] pt-12 pb-8 mt-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-zinc-800">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="bg-[#990000] text-white p-2 rounded-xs">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight uppercase font-serif-heading">
                BERITA <span className="text-red-500">PATROLI</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Portal Berita Terpercaya & Tepat Akurat menyajikan informasi hukum, kriminal, berita nasional, ekonomi, internasional, dan olahraga terkini di Indonesia.
            </p>
          </div>

          {/* Column 2: Kategori Berita */}
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-4 border-l-2 border-[#990000] pl-2.5 font-serif-heading">
              Kategori Berita
            </h3>
            <ul className="space-y-2 text-xs">
              {categories.map((cat) => (
                <li key={cat.name}>
                  <Link href={cat.href} className="hover:text-white transition flex items-center gap-1.5">
                    <span className="text-red-600">•</span>
                    <span>{cat.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Informasi Redaksi */}
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-4 border-l-2 border-[#990000] pl-2.5 font-serif-heading">
              Informasi Redaksi
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition">Pedoman Media Siber</Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition">Susunan Redaksi</Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition">Tentang Kami</Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition">Disclaimer & Privacy Policy</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Kontak */}
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-4 border-l-2 border-[#990000] pl-2.5 font-serif-heading">
              Kontak Redaksi
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>Gedung Press Center, Jl. Jend. Sudirman No. 45, Jakarta Pusat</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-red-600 shrink-0" />
                <span>+62 (021) 555-0199</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-red-600 shrink-0" />
                <span>redaksi@beritapatroli.id</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} Berita Patroli. Hak Cipta Dilindungi Undang-Undang.</p>
          <p className="uppercase tracking-widest text-[10px]">Independen • Objektif • Terpercaya</p>
        </div>
      </div>
    </footer>
  );
}
