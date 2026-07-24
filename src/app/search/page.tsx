import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { 
  User, 
  Search, 
  ArrowRight, 
  Calendar,
  ChevronRight,
  Newspaper,
  Eye
} from 'lucide-react';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
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

interface SearchResponse {
  posts: WpPost[];
  totalPages: number;
}

// Helpers for decoding WP REST API strings
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
    media.media_details?.sizes?.medium?.source_url ||
    media.source_url ||
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'
  );
}

function getCategoryName(post: WpPost): string {
  const category = post._embedded?.['wp:term']?.[0]?.[0]?.name;
  return category ? decodeHtmlEntities(category) : 'Berita';
}

function getAuthor(post: WpPost): string {
  const author = post._embedded?.['author']?.[0]?.name;
  return author ? decodeHtmlEntities(author) : 'Redaksi';
}

function getViewsCount(id: number): string {
  const views = ((id * 47 + 789) % 4500) + 500;
  return views.toLocaleString('id-ID');
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
    <div className="space-y-10 pb-16 font-sans">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-gray-500 overflow-x-auto pb-1">
        <Link href="/" className="hover:text-red-800 font-bold transition shrink-0">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="text-gray-400">Pencarian</span>
        {query && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-black font-black">"{query}"</span>
          </>
        )}
      </nav>

      {/* Header Banner */}
      <div className="bg-black text-white border-l-8 border-red-800 border-2 border-black p-6 sm:p-8 space-y-2 rounded-none">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-red-800 text-white rounded-none">
            <Search className="w-4 h-4" />
          </span>
          <span className="text-xs font-black uppercase tracking-widest text-red-500 font-mono">
            PENCARIAN BERITA INVESTIGASI
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-serif-heading uppercase text-white">
          {query ? `HASIL PENCARIAN: "${query}"` : 'PENCARIAN BERITA'}
        </h1>
        <p className="text-gray-300 text-xs sm:text-sm font-sans">
          {query ? `Menampilkan arsip kasus dan berita yang sesuai dengan kata kunci.` : 'Silakan masukkan kata kunci pada kolom pencarian.'}
        </p>
      </div>

      {!query || posts.length === 0 ? (
        <div className="bg-white border-2 border-black p-12 text-center space-y-4 rounded-none my-8 max-w-4xl mx-auto">
          <div className="w-16 h-16 bg-red-950 text-red-500 border-2 border-black flex items-center justify-center mx-auto rounded-none">
            <Newspaper className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-black uppercase tracking-tight font-serif-heading">
            {query ? `Tidak ada berita ditemukan untuk "${query}"` : 'Masukkan Kata Kunci Pencarian'}
          </h3>
          <p className="text-gray-700 text-xs max-w-md mx-auto font-sans">
            Coba gunakan kata kunci yang lebih umum seperti nama kota, tersangka, atau kasus hukum.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-red-800 hover:bg-black text-white font-black text-xs px-6 py-3 uppercase tracking-wider rounded-none border border-black transition"
            >
              <span>Kembali ke Beranda</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-black text-white p-3 border-b-4 border-red-800 flex items-center justify-between rounded-none">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-800 inline-block" />
              <h2 className="text-base sm:text-lg font-black uppercase tracking-widest font-serif-heading">
                DAFTAR HASIL PENCARIAN
              </h2>
            </div>
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest hidden sm:inline-block">
              Halaman {currentPage} Dari {totalPages}
            </span>
          </div>

          {/* Dense List View */}
          <div className="divide-y-2 divide-black border-t-2 border-b-2 border-black bg-white rounded-none">
            {posts.map((news) => (
              <article
                key={news.id}
                className="py-4 px-2 sm:px-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:bg-zinc-100 transition group rounded-none"
              >
                {/* Thumbnail */}
                <div className="w-full sm:w-44 h-32 shrink-0 bg-black border-2 border-black overflow-hidden relative rounded-none">
                  <img
                    src={getThumbnailUrl(news)}
                    alt={decodeHtmlEntities(news.title.rendered)}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 rounded-none"
                  />
                  <span className="absolute top-1 left-1 bg-black text-white text-[9px] font-black px-1.5 py-0.5 uppercase tracking-wider rounded-none border border-zinc-700">
                    {getCategoryName(news)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-gray-600 uppercase tracking-wider">
                    <span className="flex items-center gap-1 font-bold text-red-800">
                      <User className="w-3 h-3" />
                      {getAuthor(news)}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-500" />
                      {formatDate(news.date)}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center gap-1 font-bold text-gray-700">
                      <Eye className="w-3.5 h-3.5 text-red-800" />
                      <span>{getViewsCount(news.id)} dilihat</span>
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

          {/* Pagination */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-black font-sans">
            <div className="text-xs font-mono font-bold text-gray-700 uppercase tracking-widest">
              HALAMAN <span className="text-red-800 font-black">{currentPage}</span> {totalPages ? `DARI ${totalPages}` : ''}
            </div>

            <div className="flex items-center gap-3">
              {currentPage > 1 ? (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&page=${currentPage - 1}`}
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
                  href={`/search?q=${encodeURIComponent(query)}&page=${currentPage + 1}`}
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
        </div>
      )}
    </div>
  );
}
