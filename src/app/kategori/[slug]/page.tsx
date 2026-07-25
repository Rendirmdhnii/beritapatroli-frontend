import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { 
  TrendingUp, 
  ArrowRight, 
  Folder,
  ChevronRight,
  Newspaper,
  Eye
} from 'lucide-react';
import NewsCard, {
  WpPost,
  decodeHtmlEntities,
  formatDate,
  getThumbnailUrl,
  getCategory,
  getViewsCount,
} from '@/components/NewsCard';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

interface WpCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
  description: string;
}

interface WpPostsCategoryResponse {
  posts: WpPost[];
  totalPages: number;
}

// Social Media Icons SVGs
function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

// Fetch category by slug
async function getCategoryData(slug: string): Promise<WpCategory | null> {
  try {
    const res = await fetch(
      `https://beritapatroli.co.id/wp-json/wp/v2/categories?slug=${encodeURIComponent(slug)}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const categoriesList: WpCategory[] = await res.json();
    return categoriesList && categoriesList.length > 0 ? categoriesList[0] : null;
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    return null;
  }
}

// Fetch posts by category ID with pagination
async function getPostsByCategory(categoryId: number, page: number = 1): Promise<WpPostsCategoryResponse> {
  try {
    const res = await fetch(
      `https://beritapatroli.co.id/wp-json/wp/v2/posts?categories=${categoryId}&_embed&per_page=12&page=${page}`,
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
    console.error('Error fetching posts by category ID:', error);
    return { posts: [], totalPages: 1 };
  }
}

// Fetch recent overall posts for sidebar
async function getWpRecentPosts(): Promise<WpPost[]> {
  try {
    const res = await fetch('https://beritapatroli.co.id/wp-json/wp/v2/posts?_embed&per_page=5', {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// Dynamic Metadata Generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryData(slug);

  if (!category) {
    return {
      title: 'Informasi Kategori - Berita Patroli',
    };
  }

  const categoryName = decodeHtmlEntities(category.name);

  return {
    title: `Berita ${categoryName} Terkini - Berita Patroli`,
    description: category.description || `Kumpulan berita ${categoryName} terbaru dan terpercaya dari Berita Patroli.`,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedSearchParams?.page || '1', 10) || 1);

  const category = await getCategoryData(slug);

  if (!category) {
    return (
      <div className="py-20 px-4 text-center space-y-6 bg-white border-b border-gray-200 my-8 max-w-4xl mx-auto font-sans">
        <div className="w-16 h-16 bg-red-950 text-red-500 border border-red-800 flex items-center justify-center mx-auto">
          <Newspaper className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-black uppercase tracking-tight font-serif-heading">
            Informasi Kategori
          </h2>
          <p className="text-gray-700 text-sm sm:text-base max-w-xl mx-auto font-sans">
            Kategori tidak ditemukan atau sedang dimuat.
          </p>
        </div>
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-black text-white font-bold text-xs px-6 py-3 uppercase tracking-wider transition"
          >
            <span>Kembali ke Beranda</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const [{ posts, totalPages }, recentPosts] = await Promise.all([
    getPostsByCategory(category.id, currentPage),
    getWpRecentPosts(),
  ]);

  const categoryName = decodeHtmlEntities(category.name);

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-gray-500 overflow-x-auto pb-1 px-4">
        <Link href="/" className="hover:text-red-600 font-bold transition shrink-0">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="text-gray-400">Kategori</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="text-black font-bold">{categoryName}</span>
      </nav>

      {/* Category Header Banner */}
      <div className="bg-black text-white border-l-8 border-red-600 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 mx-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-red-600 text-white">
              <Folder className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-red-500 font-mono">
              EDISI KHUSUS INVESTIGASI
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight font-serif-heading uppercase text-white">
            {categoryName}
          </h1>
          {category.description && (
            <p className="text-gray-300 text-xs sm:text-sm max-w-2xl leading-relaxed font-sans">
              {category.description}
            </p>
          )}
        </div>

        {/* 4 Social Media Icons */}
        <div className="flex items-center gap-3 text-white shrink-0 sm:self-center">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="p-2.5 bg-zinc-900 border border-zinc-700 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all"
          >
            <FacebookIcon className="w-5 h-5" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="p-2.5 bg-zinc-900 border border-zinc-700 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all"
          >
            <TwitterIcon className="w-5 h-5" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="p-2.5 bg-zinc-900 border border-zinc-700 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all"
          >
            <InstagramIcon className="w-5 h-5" />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Youtube"
            className="p-2.5 bg-zinc-900 border border-zinc-700 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all"
          >
            <YoutubeIcon className="w-5 h-5" />
          </a>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white border-b border-gray-200 p-12 text-center space-y-4 mx-4">
          <div className="w-16 h-16 bg-red-950 text-red-500 flex items-center justify-center mx-auto">
            <Newspaper className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-black uppercase tracking-tight font-serif-heading">
            Belum Ada Berita Untuk Kategori {categoryName} (Halaman {currentPage})
          </h3>
          <p className="text-gray-700 text-xs max-w-md mx-auto font-sans">
            Silakan kembali ke halaman awal kategori atau ke halaman utama untuk membaca berita terkini.
          </p>
          <div className="pt-2">
            <Link
              href={`/kategori/${slug}`}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-black text-white font-bold text-xs px-5 py-2.5 transition uppercase tracking-wider"
            >
              <span>Kembali ke Halaman 1 Kategori</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
          {/* Left Column: Posts (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-black text-white p-3 border-b-4 border-red-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-600 inline-block" />
                <h2 className="text-base sm:text-lg font-bold uppercase tracking-widest font-serif-heading">
                  Arsip Berita {categoryName}
                </h2>
              </div>
              <span className="text-xs font-mono text-gray-400 uppercase tracking-widest hidden sm:inline-block">
                Halaman {currentPage} Dari {totalPages}
              </span>
            </div>

            {/* Mobile-first 1-column grid list */}
            <div className="grid grid-cols-1">
              {posts.map((news) => (
                <NewsCard key={news.id} post={news} fallbackCategory={categoryName} />
              ))}
            </div>

            {/* Pagination Navigation */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 font-sans">
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

          </div>

          {/* Right Column: Sidebar (4 Cols) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white border-b border-gray-200 p-5 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-red-600 pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                  <h3 className="text-base font-bold text-black uppercase tracking-tight font-serif-heading">
                    Berita Terkini
                  </h3>
                </div>
                <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 uppercase tracking-wider font-mono">
                  Top 5
                </span>
              </div>

              <div className="space-y-4">
                {recentPosts.map((news, index) => (
                  <div key={news.id} className="flex gap-3.5 items-start group border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                    <span className="text-2xl font-bold text-gray-400 group-hover:text-red-600 transition w-6 text-center shrink-0 leading-none font-serif-heading">
                      0{index + 1}
                    </span>
                    <div className="space-y-1 min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider font-mono">
                        {getCategory(news)}
                      </span>
                      <Link href={`/berita/${news.slug}`}>
                        <h4 className="text-xs sm:text-sm font-bold text-black group-hover:text-red-600 transition line-clamp-2 leading-snug font-serif-heading uppercase">
                          {decodeHtmlEntities(news.title.rendered)}
                        </h4>
                      </Link>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono">
                        <span>{formatDate(news.date)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-gray-700 font-semibold">
                          <Eye className="w-3 h-3 text-red-600" />
                          <span>{getViewsCount(news.id)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
