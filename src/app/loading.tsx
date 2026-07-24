import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 py-16 px-4 font-sans text-center">
      {/* Industrial Sharp Red/Black Spinner */}
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 border-4 border-black border-t-red-800 animate-spin rounded-none" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-black uppercase tracking-widest text-black font-mono">
          MEMUAT BERITA...
        </h3>
        <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">
          Berita Patroli • Hukum &amp; Investigasi
        </p>
      </div>
    </div>
  );
}
