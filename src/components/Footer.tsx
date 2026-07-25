import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-gray-400 border-t-4 border-[#ff3c36] pt-10 pb-8 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-zinc-800 items-start">
          
          {/* Kolom 1: Logo & Deskripsi Portal */}
          <div className="md:col-span-6 space-y-3">
            <Link href="/" className="inline-block">
              <div className="bg-white p-2 inline-block">
                <img
                  src="/lgberitapatroli.jpg"
                  alt="Berita Patroli Logo"
                  className="h-12 sm:h-14 w-auto object-contain block"
                />
              </div>
            </Link>
            <p className="text-xs text-gray-300 font-medium">
              PT Berita Patroli Indonesia — Menyingkap Mafia Hukum &amp; Kriminal.
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Portal berita independen yang menyajikan informasi hukum, investigasi, dan kriminal secara tajam, terpercaya, dan objektif di seluruh wilayah Indonesia.
            </p>
          </div>

          {/* Kolom 2: Navigasi Redaksi & Dokumen Legal */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#ff3c36] pb-1 inline-block">
              Informasi Redaksi
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li>
                <Link href="/berita/box-redaksi-berita-patroli" className="hover:text-[#ff3c36] transition">
                  Box Redaksi Berita Patroli
                </Link>
              </li>
              <li>
                <Link href="/berita/pedoman-pemberitaan-media-siber" className="hover:text-[#ff3c36] transition">
                  Pedoman Pemberitaan Media Siber
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-[#ff3c36] transition">
                  Tentang Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Kontak & Hak Cipta */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#ff3c36] pb-1 inline-block">
              Kontak &amp; Alamat
            </h4>
            <div className="text-xs text-gray-400 space-y-1">
              <p><strong className="text-gray-300">Email:</strong> redaksi@beritapatroli.co.id</p>
              <p><strong className="text-gray-300">Penerbit:</strong> PT Berita Patroli Indonesia</p>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Notice */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <p>© {new Date().getFullYear()} Berita Patroli. All Rights Reserved.</p>
          <p className="text-gray-400">
            Powered by <strong className="text-white">PT Berita Patroli Indonesia</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}
