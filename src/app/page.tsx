import React from 'react';
import Link from 'next/link';
import { 
  Clock, 
  User, 
  ArrowRight, 
  Newspaper,
  Calendar
} from 'lucide-react';
import HeadlineCarousel from '@/components/HeadlineCarousel';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

interface WpMediaSize {
  source_url?: string;
}

interface WpMedia {
  source_url?: string;
  media_details?: {
    sizes?: {
      medium?: WpMediaSize;
      medium_large?: WpMediaSize;
      full?: WpMediaSize;
    };
  };
}

interface WpTerm {
  id: number;
  name: string;
  slug: string;
}

interface WpAuthor {
  id: number;
  name: string;
}

interface WpPost {
  id: number;
  date: string;
  slug: string;
  link: string;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  _embedded?: {
    author?: WpAuthor[];
    'wp:featuredmedia'?: WpMedia[];
    'wp:term'?: WpTerm[][];
  };
}

interface WpPostsResponse {
  posts: WpPost[];
  totalPages: number;
}

// Helpers for parsing WP API data
function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\[&hellip;\]/g, '...');
}

function stripHtmlTags(str: string): string {
  if (!str) return '';
  const clean = str.replace(/<[^>]*>/g, '');
  return decodeHtmlEntities(clean).trim();
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function getThumbnailUrl(post: WpPost): string {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  if (!media) {
    return 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80';
  }
  return (
    media.media_details?.sizes?.medium_large?.source_url ||
    media.media_details?.sizes?.full?.source_url ||
    media.source_url ||
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'
  );
}

function getCategory(post: WpPost): string {
  const category = post._embedded?.['wp:term']?.[0]?.[0]?.name;
  return category ? decodeHtmlEntities(category) : 'Berita';
}

function getAuthor(post: WpPost): string {
  const author = post._embedded?.['author']?.[0]?.name;
  return author ? decodeHtmlEntities(author) : 'Redaksi';
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
      <div className="py-20 text-center space-y-4 border-2 border-black bg-white p-8 rounded-none my-8 max-w-4xl mx-auto">
        <div className="w-16 h-16 bg-red-950 text-red-500 border border-red-800 flex items-center justify-center mx-auto rounded-none">
          <Newspaper className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-black font-serif-heading uppercase tracking-tight">Tidak Ada Berita Ditemukan</h2>
        <p className="text-gray-700 text-xs max-w-md mx-auto font-sans">
          Gagal memuat berita untuk halaman {currentPage} dari server WordPress REST API. Silakan coba muat ulang atau kembali ke halaman utama.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-red-800 hover:bg-black text-white font-black text-xs px-5 py-2.5 transition uppercase tracking-wider rounded-none border border-black"
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
    <div className="space-y-10 pb-16 font-sans">
      
      {/* ================= 1. AUTO-SLIDER HEADLINE CAROUSEL (HALAMAN 1 SAJA) ================= */}
      {isFirstPage && <HeadlineCarousel posts={posts} />}

      {/* ================= 2. GRID INVESTIGASI SEKUNDER (HALAMAN 1 SAJA) ================= */}
      {isFirstPage && secondaryHeadlines.length > 0 && (
        <section className="space-y-4">
          <div className="border-b-4 border-black pb-2 flex items-center justify-between">
            <h2 className="text-lg font-black text-black uppercase tracking-wider font-serif-heading flex items-center gap-2">
              <span className="w-3 h-3 bg-red-800 inline-block" />
              Laporan Utama & Kasus Menonjol
            </h2>
            <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest hidden sm:inline-block">
              Edisi Khusus Investigasi
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {secondaryHeadlines.map((news) => (
              <article
                key={news.id}
                className="bg-white border-2 border-black flex flex-col justify-between hover:bg-zinc-50 transition group rounded-none"
              >
                <div className="relative h-48 w-full overflow-hidden bg-black border-b-2 border-black rounded-none">
                  <img
                    src={getThumbnailUrl(news)}
                    alt={decodeHtmlEntities(news.title.rendered)}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 rounded-none"
                  />
                  <span className="absolute top-2 left-2 bg-red-800 text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-wider rounded-none">
                    {getCategory(news)}
                  </span>
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-gray-500 uppercase">
                      <Clock className="w-3.5 h-3.5 text-red-800" />
                      <span>{formatDate(news.date)}</span>
                    </div>

                    <Link href={`/berita/${news.slug}`}>
                      <h3 className="text-base font-black text-black group-hover:text-red-800 transition leading-snug font-serif-heading uppercase line-clamp-2">
                        {decodeHtmlEntities(news.title.rendered)}
                      </h3>
                    </Link>
                  </div>

                  <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed pt-2 border-t border-gray-200">
                    {stripHtmlTags(news.excerpt.rendered)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ================= 3. DAFTAR BERITA 'KORAN KRIMINAL' (DENSE LIST VIEW WITH BORDER-B-2 BORDER-BLACK) ================= */}
      <section className="space-y-4">
        {/* Header Seksi */}
        <div className="bg-black text-white p-3 border-b-4 border-red-800 flex items-center justify-between rounded-none">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-red-500" />
            <h2 className="text-base sm:text-lg font-black uppercase tracking-widest font-serif-heading">
              {isFirstPage ? 'Arsip Berita & Catatan Kriminal Terbaru' : `Arsip Berita Kriminal - Halaman ${currentPage}`}
            </h2>
          </div>
          <span className="text-xs font-mono text-gray-400 uppercase tracking-widest hidden sm:inline-block">
            Halaman {currentPage} Dari {totalPages}
          </span>
        </div>

        {/* Dense List View */}
        <div className="divide-y-2 divide-black border-t-2 border-b-2 border-black bg-white rounded-none">
          {remainingNews.map((news) => (
            <article
              key={news.id}
              className="py-4 px-2 sm:px-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:bg-zinc-100 transition group rounded-none"
            >
              {/* Thumbnail Gambar */}
              <div className="w-full sm:w-44 h-32 shrink-0 bg-black border-2 border-black overflow-hidden relative rounded-none">
                <img
                  src={getThumbnailUrl(news)}
                  alt={decodeHtmlEntities(news.title.rendered)}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 rounded-none"
                />
                <span className="absolute top-1 left-1 bg-black text-white text-[9px] font-black px-1.5 py-0.5 uppercase tracking-wider rounded-none border border-zinc-700">
                  {getCategory(news)}
                </span>
              </div>

              {/* Teks Content */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-3 text-[11px] font-mono text-gray-600 uppercase tracking-wider">
                  <span className="flex items-center gap-1 font-bold text-red-800">
                    <User className="w-3 h-3" />
                    {getAuthor(news)}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-500" />
                    {formatDate(news.date)}
                  </span>
                </div>

                <Link href={`/berita/${news.slug}`}>
                  <h3 className="text-base sm:text-lg font-black text-black group-hover:text-red-800 transition leading-snug font-serif-heading uppercase line-clamp-2">
                    {decodeHtmlEntities(news.title.rendered)}
                  </h3>
                </Link>

                <p className="text-xs sm:text-sm text-gray-700 line-clamp-2 leading-relaxed font-sans">
                  {stripHtmlTags(news.excerpt.rendered)}
                </p>

                <div className="pt-1">
                  <Link
                    href={`/berita/${news.slug}`}
                    className="inline-flex items-center gap-1 text-red-800 hover:text-black font-black text-[11px] uppercase tracking-wider transition"
                  >
                    <span>Baca Kasus Lengkap</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* ================= TOMBOL NAVIGASI PAGINATION GARANG ================= */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-black font-sans">
          <div className="text-xs font-mono font-bold text-gray-700 uppercase tracking-widest">
            HALAMAN <span className="text-red-800 font-black">{currentPage}</span> {totalPages ? `DARI ${totalPages}` : ''}
          </div>

          <div className="flex items-center gap-3">
            {currentPage > 1 ? (
              <Link
                href={`?page=${currentPage - 1}`}
                className="px-5 py-2.5 bg-black hover:bg-red-800 text-white font-black text-xs uppercase tracking-wider rounded-none border-2 border-black transition inline-flex items-center gap-1"
              >
                <span>&lt;&lt; SEBELUMNYA</span>
              </Link>
            ) : (
              <span className="px-5 py-2.5 bg-gray-200 text-gray-400 font-black text-xs uppercase tracking-wider rounded-none border-2 border-gray-300 cursor-not-allowed inline-flex items-center gap-1">
                &lt;&lt; SEBELUMNYA
              </span>
            )}

            {currentPage < totalPages ? (
              <Link
                href={`?page=${currentPage + 1}`}
                className="px-5 py-2.5 bg-black hover:bg-red-800 text-white font-black text-xs uppercase tracking-wider rounded-none border-2 border-black transition inline-flex items-center gap-1"
              >
                <span>SELANJUTNYA &gt;&gt;</span>
              </Link>
            ) : (
              <span className="px-5 py-2.5 bg-gray-200 text-gray-400 font-black text-xs uppercase tracking-wider rounded-none border-2 border-gray-300 cursor-not-allowed inline-flex items-center gap-1">
                SELANJUTNYA &gt;&gt;
              </span>
            )}
          </div>
        </div>

      </section>

    </div>
  );
}
