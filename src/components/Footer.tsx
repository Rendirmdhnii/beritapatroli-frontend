import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 border-t-8 border-red-800 py-10 mt-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 pb-8 border-b border-zinc-900">
          {/* Bagian Kiri: Logo */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link href="/">
              <div className="bg-white p-2.5 inline-block">
                <img
                  src="/lgberitapatroli.jpg"
                  alt="Berita Patroli Logo"
                  className="h-14 sm:h-16 w-auto object-contain block"
                />
              </div>
            </Link>
            <p className="text-xs text-gray-400 font-mono uppercase tracking-widest text-center md:text-left">
              Portal Berita Investigasi &amp; Hukum
            </p>
          </div>

          {/* Bagian Kanan: Kontak Redaksi & Alamat (Rata Kanan & Elegan) */}
          <div className="text-center md:text-right space-y-3">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider border-b-2 border-red-800 pb-1 inline-block font-mono">
              Kontak Redaksi &amp; Alamat
            </h3>
            <div className="text-xs text-gray-300 leading-relaxed space-y-1 font-sans">
              <p className="font-bold text-gray-200 uppercase tracking-wider font-mono">
                Sidoarjo
              </p>
              <p>
                <span className="font-semibold text-gray-400">Telepon / WA:</span> 0812345678910
              </p>
              <p>
                <span className="font-semibold text-gray-400">Email:</span> redaksi@beritapatroli.id
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-gray-500 font-mono uppercase tracking-wider gap-3">
          <p>© {new Date().getFullYear()} BERITA PATROLI. HAK CIPTA DILINDUNGI UNDANG-UNDANG.</p>
          <p className="text-red-700 font-bold">INVESTIGASI • INDEPENDEN • TAJAM</p>
        </div>
      </div>
    </footer>
  );
}
