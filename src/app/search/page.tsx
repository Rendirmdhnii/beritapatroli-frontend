import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { 
  Search, 
  ArrowRight, 
  ChevronRight,
  Newspaper
} from 'lucide-react';
import NewsCard, {
  WpPost,
} from '@/components/NewsCard';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

interface SearchResponse {
  posts: WpPost[];
  totalPages: number;
}

// Fetch posts by search term
async function searchWpPosts(query: string, page: number = 1): Promise<SearchResponse> {
  if (!query) return { posts: [], totalPages: 1 };
  try {
    const res = await fetch(
      `https://beritapatroli.co.id/wp-json/wp/v2/posts?search=${encodeURIComponent(query)}&_embed&per_page=12&page=${page}`,
      { cache: 'no-store' }
    );
    if (!res.ok) {
      return { posts: [], totalPages: 1 };
    }

    const totalPagesHeader = res.headers.get('X-WP-TotalPages');
    const totalPages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : 1;
    const posts: WpPost[] = await res.json();
    return { posts, totalPages };
  } catch (error) {
    console.error('Error searching WP posts:', error);
    return { posts: [], totalPages: 1 };
  }
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams?.q || '';
  return {
    title: q ? `Pencarian: "${q}" - Berita Patroli` : 'Pencarian Berita - Berita Patroli',
    description: `Hasil pencarian berita investigasi untuk kata kunci ${q}`,
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q || '';
  const currentPage = Math.max(1, parseInt(resolvedSearchParams?.page || '1', 10) || 1);

  const { posts, totalPages } = await searchWpPosts(query, currentPage);

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-gray-500 overflow-x-auto pb-1 px-4">
        <Link href="/" className="hover:text-red-600 font-bold transition shrink-0">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="text-gray-400">Pencarian</span>
        {query && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-black font-bold">"{query}"</span>
          </>
        )}
      </nav>

      {/* Header Banner */}
      <div className="bg-black text-white border-l-8 border-red-600 p-6 sm:p-8 space-y-2 mx-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-red-600 text-white">
            <Search className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-red-500 font-mono">
            PENCARIAN BERITA INVESTIGASI
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight font-serif-heading uppercase text-white">
          {query ? `HASIL PENCARIAN: "${query}"` : 'PENCARIAN BERITA'}
        </h1>
        <p className="text-gray-300 text-xs sm:text-sm font-sans">
          {query ? `Menampilkan arsip kasus dan berita yang sesuai dengan kata kunci.` : 'Silakan masukkan kata kunci pada kolom pencarian.'}
        </p>
      </div>

      {!query || posts.length === 0 ? (
        <div className="bg-white border-b border-gray-200 p-12 text-center space-y-4 mx-4 max-w-4xl sm:mx-auto">
          <div className="w-16 h-16 bg-red-950 text-red-500 flex items-center justify-center mx-auto">
            <Newspaper className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-black uppercase tracking-tight font-serif-heading">
            {query ? `Tidak ada berita ditemukan untuk "${query}"` : 'Masukkan Kata Kunci Pencarian'}
          </h3>
          <p className="text-gray-700 text-xs max-w-md mx-auto font-sans">
            Coba gunakan kata kunci yang lebih umum seperti nama kota, tersangka, atau kasus hukum.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-black text-white font-bold text-xs px-6 py-3 uppercase tracking-wider transition"
            >
              <span>Kembali ke Beranda</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="px-4">
            <div className="bg-black text-white p-3 border-b-4 border-red-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-600 inline-block" />
                <h2 className="text-base sm:text-lg font-bold uppercase tracking-widest font-serif-heading">
                  DAFTAR HASIL PENCARIAN
                </h2>
              </div>
              <span className="text-xs font-mono text-gray-400 uppercase tracking-widest hidden sm:inline-block">
                Halaman {currentPage} Dari {totalPages}
              </span>
            </div>
          </div>

          {/* Grid Container 1 Kolom di HP dengan px-4 */}
          <div className="grid grid-cols-1 px-4">
            {posts.map((news) => (
              <NewsCard key={news.id} post={news} />
            ))}
          </div>

          {/* Pagination */}
          <div className="pt-6 px-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 font-sans">
            <div className="text-xs font-mono font-bold text-gray-700 uppercase tracking-widest">
              HALAMAN <span className="text-red-600 font-black">{currentPage}</span> {totalPages ? `DARI ${totalPages}` : ''}
            </div>

            <div className="flex items-center gap-3">
              {currentPage > 1 ? (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&page=${currentPage - 1}`}
                  className="px-5 py-2.5 bg-black hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition inline-flex items-center gap-1"
                >
                  <span>&lt;&lt; SEBELUMNYA</span>
                </Link>
              ) : (
                <span className="px-5 py-2.5 bg-gray-200 text-gray-400 font-bold text-xs uppercase tracking-wider cursor-not-allowed inline-flex items-center gap-1">
                  &lt;&lt; SEBELUMNYA
                </span>
              )}

              {currentPage < totalPages ? (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&page=${currentPage + 1}`}
                  className="px-5 py-2.5 bg-black hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition inline-flex items-center gap-1"
                >
                  <span>SELANJUTNYA &gt;&gt;</span>
                </Link>
              ) : (
                <span className="px-5 py-2.5 bg-gray-200 text-gray-400 font-bold text-xs uppercase tracking-wider cursor-not-allowed inline-flex items-center gap-1">
                  SELANJUTNYA &gt;&gt;
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
