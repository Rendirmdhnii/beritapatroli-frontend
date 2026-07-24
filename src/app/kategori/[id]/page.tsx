import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { 
  Clock, 
  User, 
  Flame, 
  TrendingUp, 
  ArrowRight, 
  Folder,
  Calendar,
  ChevronRight,
  Newspaper
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
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
    media.media_details?.sizes?.medium?.source_url ||
    media.source_url ||
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'
  );
}

function getCategory(post: WpPost, fallbackName: string): string {
  const category = post._embedded?.['wp:term']?.[0]?.[0]?.name;
  return category ? decodeHtmlEntities(category) : fallbackName;
}

function getAuthor(post: WpPost): string {
  const author = post._embedded?.['author']?.[0]?.name;
  return author ? decodeHtmlEntities(author) : 'Redaksi';
}

// Fetch Category metadata by ID
async function getWpCategory(id: string): Promise<WpCategory | null> {
  try {
    const res = await fetch(`https://beritapatroli.co.id/wp-json/wp/v2/categories/${id}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching WP category details:', error);
    return null;
  }
}

// Fetch Posts by Category ID
async function getWpPostsByCategory(id: string): Promise<WpPost[]> {
  try {
    const res = await fetch(
      `https://beritapatroli.co.id/wp-json/wp/v2/posts?categories=${id}&_embed`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Error fetching WP posts by category:', error);
    return [];
  }
}

// Fetch recent overall posts for sidebar
async function getWpRecentPosts(): Promise<WpPost[]> {
  try {
    const res = await fetch('https://beritapatroli.co.id/wp-json/wp/v2/posts?_embed&per_page=5', {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// Dynamic Metadata Generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const category = await getWpCategory(id);

  if (!category) {
    return {
      title: 'Kategori Berita Tidak Ditemukan - Berita Patroli',
    };
  }

  const categoryName = decodeHtmlEntities(category.name);

  return {
    title: `Berita ${categoryName} Terkini - Berita Patroli`,
    description: category.description || `Kumpulan berita ${categoryName} terbaru dan terpercaya dari Berita Patroli.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch category info and category posts in parallel
  const [category, posts, recentPosts] = await Promise.all([
    getWpCategory(id),
    getWpPostsByCategory(id),
    getWpRecentPosts(),
  ]);

  if (!category) {
    notFound();
  }

  const categoryName = decodeHtmlEntities(category.name);
  const mainHeadline = posts[0];
  const sideHeadlines = posts.slice(1, 4);
  const remainingNews = posts.slice(4);

  return (
    <div className="space-y-10 pb-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto pb-1">
        <Link href="/" className="hover:text-[#990000] font-semibold transition shrink-0">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-400 font-medium">Kategori</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-[#111111] font-bold">{categoryName}</span>
      </nav>

      {/* Category Header Banner - Flat Newspaper Style */}
      <div className="bg-[#111111] text-white border-l-4 border-[#990000] border-y border-r border-zinc-800 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-[#990000] text-white">
              <Folder className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-red-400 font-sans">
              Kategori Berita
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-serif-heading">
            {categoryName}
          </h1>
          {category.description && (
            <p className="text-zinc-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {category.description}
            </p>
          )}
        </div>
        <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 text-center shrink-0">
          <p className="text-2xl font-extrabold text-white font-serif-heading">{posts.length}</p>
          <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Artikel Berita</p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-[#990000] border border-red-200 flex items-center justify-center mx-auto">
            <Newspaper className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#111111] font-serif-heading">
            Belum ada berita untuk kategori {categoryName}
          </h3>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            Silakan kembali ke halaman utama untuk membaca berita terkini lainnya.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#990000] hover:bg-[#800000] text-white font-bold text-xs px-5 py-2.5 transition uppercase tracking-wider"
          >
            <span>Kembali ke Beranda</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <>
          {/* ================= HERO SECTION / HEADLINE ================= */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#990000] pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-[#990000] text-white">
                  <Flame className="w-4 h-4" />
                </span>
                <h2 className="text-xl font-extrabold text-[#111111] uppercase tracking-tight font-serif-heading">
                  Headline {categoryName}
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:block">
                Berita Populer Kategori
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Main Headline Card */}
              {mainHeadline && (
                <div className="lg:col-span-8 group relative bg-white border border-gray-200 overflow-hidden">
                  <div className="relative h-[340px] sm:h-[440px] w-full overflow-hidden bg-black">
                    <img
                      src={getThumbnailUrl(mainHeadline)}
                      alt={decodeHtmlEntities(mainHeadline.title.rendered)}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      <span className="bg-[#990000] text-white text-[11px] font-extrabold px-3 py-1 uppercase tracking-wider flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        Headline
                      </span>
                      <span className="bg-[#111111] text-white text-[11px] font-semibold px-3 py-1 uppercase tracking-wider">
                        {categoryName}
                      </span>
                    </div>

                    {/* Headline Text overlay */}
                    <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 space-y-3">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                        <span className="flex items-center gap-1 font-medium">
                          <User className="w-3.5 h-3.5 text-red-400" />
                          {getAuthor(mainHeadline)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-red-400" />
                          {formatDate(mainHeadline.date)}
                        </span>
                      </div>

                      <Link href={`/berita/${mainHeadline.slug}`}>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight hover:text-red-400 transition line-clamp-2 font-serif-heading">
                          {decodeHtmlEntities(mainHeadline.title.rendered)}
                        </h2>
                      </Link>

                      <p className="text-slate-300 text-sm line-clamp-2 leading-relaxed hidden sm:block">
                        {stripHtmlTags(mainHeadline.excerpt.rendered)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Side Headlines List */}
              <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 px-1 font-serif-heading">
                  Berita Terkait {categoryName}
                </h3>
                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  {sideHeadlines.map((news) => (
                    <div
                      key={news.id}
                      className="bg-white border border-gray-200 p-3 flex gap-3 hover:border-[#990000] transition group"
                    >
                      <div className="w-24 h-24 sm:w-28 sm:h-24 overflow-hidden shrink-0 relative bg-gray-100 border border-gray-200">
                        <img
                          src={getThumbnailUrl(news)}
                          alt={decodeHtmlEntities(news.title.rendered)}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </div>

                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        <div className="space-y-1">
                          <span className="inline-block text-[10px] font-bold text-[#990000] uppercase tracking-wider">
                            {getCategory(news, categoryName)}
                          </span>
                          <Link href={`/berita/${news.slug}`}>
                            <h4 className="text-xs sm:text-sm font-bold text-[#111111] group-hover:text-[#990000] transition line-clamp-2 leading-snug font-serif-heading">
                              {decodeHtmlEntities(news.title.rendered)}
                            </h4>
                          </Link>
                        </div>

                        <div className="flex items-center text-[11px] text-slate-500 mt-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {formatDate(news.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ================= MAIN CONTENT & SIDEBAR ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: News Grid (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between border-b-2 border-[#111111] pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-5 bg-[#990000] inline-block" />
                  <h3 className="text-xl font-extrabold text-[#111111] uppercase tracking-tight font-serif-heading">
                    Daftar Berita {categoryName}
                  </h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {posts.length} Berita Ditemukan
                </span>
              </div>

              {/* Grid Layout using Tailwind CSS with border-gray-200 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {(remainingNews.length > 0 ? remainingNews : posts).map((news) => (
                  <article
                    key={news.id}
                    className="bg-white border border-gray-200 overflow-hidden flex flex-col group hover:border-[#990000] transition duration-200"
                  >
                    {/* Thumbnail Image */}
                    <div className="relative h-48 w-full overflow-hidden bg-gray-100 border-b border-gray-200">
                      <img
                        src={getThumbnailUrl(news)}
                        alt={decodeHtmlEntities(news.title.rendered)}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-[#111111] text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider">
                        {getCategory(news, categoryName)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            {getAuthor(news)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(news.date)}
                          </span>
                        </div>

                        <Link href={`/berita/${news.slug}`}>
                          <h4 className="text-base font-bold text-[#111111] group-hover:text-[#990000] transition leading-snug line-clamp-2 font-serif-heading">
                            {decodeHtmlEntities(news.title.rendered)}
                          </h4>
                        </Link>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {stripHtmlTags(news.excerpt.rendered)}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#990000] font-semibold">
                        <Link
                          href={`/berita/${news.slug}`}
                          className="inline-flex items-center gap-1 hover:gap-2 transition-all uppercase text-[11px] tracking-wider font-bold"
                        >
                          <span>Baca Selengkapnya</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Right Column: Sidebar (4 Cols) */}
            <aside className="lg:col-span-4 space-y-8">
              {/* Trending / Terpopuler Widget */}
              <div className="bg-white border border-gray-200 p-5 space-y-4">
                <div className="flex items-center justify-between border-b-2 border-[#990000] pb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#990000]" />
                    <h3 className="text-base font-extrabold text-[#111111] uppercase tracking-tight font-serif-heading">
                      Berita Terkini
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold bg-red-100 text-[#990000] px-2 py-0.5 uppercase tracking-wider">
                    Top 5
                  </span>
                </div>

                <div className="space-y-4">
                  {recentPosts.map((news, index) => (
                    <div key={news.id} className="flex gap-3.5 items-start group border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                      <span className="text-2xl font-black text-slate-300 group-hover:text-[#990000] transition w-6 text-center shrink-0 leading-none font-serif-heading">
                        0{index + 1}
                      </span>
                      <div className="space-y-1 min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-[#990000] uppercase tracking-wider">
                          {getCategory(news, categoryName)}
                        </span>
                        <Link href={`/berita/${news.slug}`}>
                          <h4 className="text-xs sm:text-sm font-bold text-[#111111] group-hover:text-[#990000] transition line-clamp-2 leading-snug font-serif-heading">
                            {decodeHtmlEntities(news.title.rendered)}
                          </h4>
                        </Link>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>{formatDate(news.date)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
