import React from 'react';
import Link from 'next/link';
import { Newspaper, Calendar, Eye, User } from 'lucide-react';
import HeadlineCarousel from '@/components/HeadlineCarousel';
import NewsCard, {
  WpPost,
  decodeHtmlEntities,
  stripHtmlTags,
  formatDate,
  getThumbnailUrl,
  getCategory,
  getAuthor,
  getViewsCount,
} from '@/components/NewsCard';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

interface WpPostsResponse {
  posts: WpPost[];
  totalPages: number;
}

// Fetch posts from WordPress REST API with real-time fetch (no-store)
async function getWpPosts(page: number = 1): Promise<WpPostsResponse> {
  try {
    const res = await fetch(`https://beritapatroli.co.id/wp-json/wp/v2/posts?_embed&per_page=12&page=${page}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return { posts: [], totalPages: 1 };
    }

    const totalPagesHeader = res.headers.get('X-WP-TotalPages');
    const totalPages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : 1;
    const posts: WpPost[] = await res.json();
    return { posts, totalPages };
  } catch (error) {
    console.error('Error fetching WordPress posts:', error);
    return { posts: [], totalPages: 1 };
  }
}

export default async function HomePage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedSearchParams?.page || '1', 10) || 1);

  const { posts, totalPages } = await getWpPosts(currentPage);

  if (!posts || posts.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 bg-white p-8 my-8 max-w-4xl mx-auto border-b border-gray-200">
        <div className="w-16 h-16 bg-red-950 text-red-500 flex items-center justify-center mx-auto">
          <Newspaper className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-black font-serif-heading uppercase tracking-tight">Tidak Ada Berita Ditemukan</h2>
        <p className="text-gray-700 text-xs max-w-md mx-auto font-sans">
          Gagal memuat berita untuk halaman {currentPage} dari server WordPress REST API. Silakan coba muat ulang atau kembali ke halaman utama.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-black text-white font-bold text-xs px-5 py-2.5 transition uppercase tracking-wider"
          >
            <span>Kembali ke Halaman 1</span>
          </Link>
        </div>
      </div>
    );
  }

  const isFirstPage = currentPage === 1;
  const secondaryHeadlines = isFirstPage ? posts.slice(1, 4) : [];
  const remainingNews = isFirstPage ? posts.slice(4) : posts;

  return (
    <div className="space-y-8 pb-16 font-sans">
      
      {/* ================= 1. AUTO-SLIDER HEADLINE CAROUSEL (HALAMAN 1 SAJA) ================= */}
      {isFirstPage && <HeadlineCarousel posts={posts} />}

      {/* ================= 2. GRID INVESTIGASI SEKUNDER (HALAMAN 1 SAJA) ================= */}
      {isFirstPage && secondaryHeadlines.length > 0 && (
        <section className="space-y-4 px-4">
          <div className="border-b-2 border-red-600 pb-2 flex items-center justify-between">
            <h2 className="text-lg font-bold text-black uppercase tracking-wider font-serif-heading flex items-center gap-2">
              <span className="w-3 h-3 bg-red-600 inline-block" />
              LAPORAN UTAMA &amp; KASUS MENONJOL
            </h2>
            <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest hidden sm:inline-block">
              EDISI KHUSUS INVESTIGASI
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {secondaryHeadlines.map((news) => (
              <article
                key={news.id}
                className="bg-white border-b border-gray-200 pb-4 flex flex-col justify-between hover:bg-zinc-50 transition group"
              >
                {/* Aspect 16/9 Ratio Image Container */}
                <div className="relative w-full aspect-video overflow-hidden bg-black">
                  <img
                    src={getThumbnailUrl(news)}
                    alt={decodeHtmlEntities(news.title.rendered)}
                    className="w-full aspect-video object-cover group-hover:scale-105 transition duration-500 opacity-95"
                  />
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                    {getCategory(news)}
                  </span>
                </div>

                <div className="pt-3 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] md:text-xs text-gray-500 mb-2 mt-2 font-medium uppercase">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-red-600" />
                        {getAuthor(news)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-red-600" />
                        {formatDate(news.date)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-red-600" />
                        <span>{getViewsCount(news.id)} DILIHAT</span>
                      </span>
                    </div>

                    <Link href={`/berita/${news.slug}`}>
                      <h3 className="text-base md:text-xl font-bold leading-snug hover:text-red-600 transition-colors font-serif-heading line-clamp-2">
                        {decodeHtmlEntities(news.title.rendered)}
                      </h3>
                    </Link>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mt-1 leading-relaxed">
                    {stripHtmlTags(news.excerpt.rendered)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ================= 3. DAFTAR BERITA 'BERITA PATROLI' (MOBILE-FIRST 1-COLUMN WITH PX-4 & BORDER-B BORDER-GRAY-200) ================= */}
      <section className="space-y-4">
        {/* Header Seksi */}
        <div className="px-4">
          <div className="bg-black text-white p-3 border-b-4 border-red-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-600 inline-block" />
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-widest font-serif-heading">
                ARSIP BERITA &amp; CATATAN KRIMINAL TERBARU
              </h2>
            </div>
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest hidden sm:inline-block">
              Halaman {currentPage} Dari {totalPages}
            </span>
          </div>
        </div>

        {/* Container Utama Grid Daftar Berita (1 Kolom di Mobile, px-4) */}
        <div className="grid grid-cols-1 px-4">
          {remainingNews.map((news) => (
            <NewsCard key={news.id} post={news} />
          ))}
        </div>

        {/* ================= TOMBOL NAVIGASI PAGINATION ================= */}
        <div className="pt-6 px-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 font-sans">
          <div className="text-xs font-mono font-bold text-gray-700 uppercase tracking-widest">
            HALAMAN <span className="text-red-600 font-black">{currentPage}</span> {totalPages ? `DARI ${totalPages}` : ''}
          </div>

          <div className="flex items-center gap-3">
            {currentPage > 1 ? (
              <Link
                href={`?page=${currentPage - 1}`}
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
                href={`?page=${currentPage + 1}`}
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

      </section>

    </div>
  );
}
