import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { 
  User, 
  TrendingUp, 
  ArrowRight, 
  Folder,
  Calendar,
  ChevronRight,
  Newspaper,
  Eye
} from 'lucide-react';

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

function getCategoryNameFromPost(post: WpPost, fallbackName: string): string {
  const category = post._embedded?.['wp:term']?.[0]?.[0]?.name;
  return category ? decodeHtmlEntities(category) : fallbackName;
}

function getAuthor(post: WpPost): string {
  const author = post._embedded?.['author']?.[0]?.name;
  return author ? decodeHtmlEntities(author) : 'Redaksi';
}

function getViewsCount(id: number): string {
  const views = ((id * 47 + 789) % 4500) + 500;
  return views.toLocaleString('id-ID');
}

// ================= FETCH CATEGORY BY SLUG =================
async function getCategory(slug: string): Promise<WpCategory | null> {
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

// ================= FETCH POSTS BY CATEGORY ID WITH PAGINATION =================
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
  const category = await getCategory(slug);

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

  // Tangkap kategori dari slug URL
  const category = await getCategory(slug);

  // Jika kategori tidak ditemukan (array kosong), JANGAN panggil notFound(). Tampilkan UI rapi anti-404.
  if (!category) {
    return (
      <div className="py-20 px-4 text-center space-y-6 bg-white border-2 border-black rounded-none my-8 max-w-4xl mx-auto font-sans">
        <div className="w-16 h-16 bg-red-950 text-red-500 border-2 border-black flex items-center justify-center mx-auto rounded-none">
          <Newspaper className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight font-serif-heading">
            Informasi Kategori
          </h2>
          <p className="text-gray-700 text-sm sm:text-base max-w-xl mx-auto font-sans">
            Kategori tidak ditemukan atau sedang dimuat.
          </p>
        </div>
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-red-800 hover:bg-black text-white font-black text-xs px-6 py-3 uppercase tracking-wider rounded-none border border-black transition"
          >
            <span>Kembali ke Beranda</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Jika kategori ditemukan, panggil getPostsByCategory(category.id, currentPage)
  const [{ posts, totalPages }, recentPosts] = await Promise.all([
    getPostsByCategory(category.id, currentPage),
    getWpRecentPosts(),
  ]);

  const categoryName = decodeHtmlEntities(category.name);

  return (
    <div className="space-y-10 pb-16 font-sans">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-gray-500 overflow-x-auto pb-1">
        <Link href="/" className="hover:text-red-800 font-bold transition shrink-0">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="text-gray-400">Kategori</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="text-black font-black">{categoryName}</span>
      </nav>

      {/* Clean Industrial Category Header Banner + 4 Social Icons */}
      <div className="bg-black text-white border-l-8 border-red-800 border-2 border-black p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-none">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-red-800 text-white rounded-none">
              <Folder className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-red-500 font-mono">
              EDISI KHUSUS INVESTIGASI
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-serif-heading uppercase text-white">
            {categoryName}
          </h1>
          {category.description && (
            <p className="text-gray-300 text-xs sm:text-sm max-w-2xl leading-relaxed font-sans">
              {category.description}
            </p>
          )}
        </div>

        {/* 4 Social Media Icons Sejajar Kanan */}
        <div className="flex items-center gap-3 text-white shrink-0 sm:self-center">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="p-2.5 bg-zinc-900 border border-zinc-700 hover:bg-red-800 hover:border-red-800 hover:text-white transition-all rounded-none"
          >
            <FacebookIcon className="w-5 h-5" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="p-2.5 bg-zinc-900 border border-zinc-700 hover:bg-red-800 hover:border-red-800 hover:text-white transition-all rounded-none"
          >
            <TwitterIcon className="w-5 h-5" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="p-2.5 bg-zinc-900 border border-zinc-700 hover:bg-red-800 hover:border-red-800 hover:text-white transition-all rounded-none"
          >
            <InstagramIcon className="w-5 h-5" />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Youtube"
            className="p-2.5 bg-zinc-900 border border-zinc-700 hover:bg-red-800 hover:border-red-800 hover:text-white transition-all rounded-none"
          >
            <YoutubeIcon className="w-5 h-5" />
          </a>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white border-2 border-black p-12 text-center space-y-4 rounded-none">
          <div className="w-16 h-16 bg-red-950 text-red-500 border border-black flex items-center justify-center mx-auto rounded-none">
            <Newspaper className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-black uppercase tracking-tight font-serif-heading">
            Belum Ada Berita Untuk Kategori {categoryName} (Halaman {currentPage})
          </h3>
          <p className="text-gray-700 text-xs max-w-md mx-auto font-sans">
            Silakan kembali ke halaman awal kategori atau ke halaman utama untuk membaca berita terkini.
          </p>
          <div className="pt-2">
            <Link
              href={`/kategori/${slug}`}
              className="inline-flex items-center gap-2 bg-red-800 hover:bg-black text-white font-black text-xs px-5 py-2.5 transition uppercase tracking-wider rounded-none"
            >
              <span>Kembali ke Halaman 1 Kategori</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Grid Investigasi Posts (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-black text-white p-3 border-b-4 border-red-800 flex items-center justify-between rounded-none">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-800 inline-block" />
                <h2 className="text-base sm:text-lg font-black uppercase tracking-widest font-serif-heading">
                  Arsip Berita {categoryName}
                </h2>
              </div>
              <span className="text-xs font-mono text-gray-400 uppercase tracking-widest hidden sm:inline-block">
                Halaman {currentPage} Dari {totalPages}
              </span>
            </div>

            {/* Dense List View with border-b-2 border-black */}
            <div className="divide-y-2 divide-black border-t-2 border-b-2 border-black bg-white rounded-none">
              {posts.map((news) => (
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
                      {getCategoryNameFromPost(news, categoryName)}
                    </span>
                  </div>

                  {/* Content Teks */}
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

          </div>

          {/* Right Column: Sidebar (4 Cols) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white border-2 border-black p-5 space-y-4 rounded-none">
              <div className="flex items-center justify-between border-b-2 border-red-800 pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-red-800" />
                  <h3 className="text-base font-black text-black uppercase tracking-tight font-serif-heading">
                    Berita Terkini
                  </h3>
                </div>
                <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 uppercase tracking-wider font-mono">
                  Top 5
                </span>
              </div>

              <div className="space-y-4">
                {recentPosts.map((news, index) => (
                  <div key={news.id} className="flex gap-3.5 items-start group border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                    <span className="text-2xl font-black text-gray-400 group-hover:text-red-800 transition w-6 text-center shrink-0 leading-none font-serif-heading">
                      0{index + 1}
                    </span>
                    <div className="space-y-1 min-w-0 flex-1">
                      <span className="text-[10px] font-black text-red-800 uppercase tracking-wider font-mono">
                        {getCategoryNameFromPost(news, categoryName)}
                      </span>
                      <Link href={`/berita/${news.slug}`}>
                        <h4 className="text-xs sm:text-sm font-black text-black group-hover:text-red-800 transition line-clamp-2 leading-snug font-serif-heading uppercase">
                          {decodeHtmlEntities(news.title.rendered)}
                        </h4>
                      </Link>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono">
                        <span>{formatDate(news.date)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-gray-700 font-semibold">
                          <Eye className="w-3 h-3 text-red-800" />
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
