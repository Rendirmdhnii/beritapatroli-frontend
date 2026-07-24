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
  Newspaper
} from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
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

// ================= FETCH CATEGORY BY SLUG =================
async function getCategory(slug: string): Promise<WpCategory | null> {
  try {
    const res = await fetch(
      `https://beritapatroli.co.id/wp-json/wp/v2/categories?slug=${encodeURIComponent(slug)}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const categoriesList: WpCategory[] = await res.json();
    return categoriesList && categoriesList.length > 0 ? categoriesList[0] : null;
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    return null;
  }
}

// ================= FETCH POSTS BY CATEGORY ID =================
async function getPostsByCategory(categoryId: number): Promise<WpPost[]> {
  try {
    const res = await fetch(
      `https://beritapatroli.co.id/wp-json/wp/v2/posts?categories=${categoryId}&_embed&per_page=12`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Error fetching posts by category ID:', error);
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

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;

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

  // Jika kategori ditemukan, ambil ID-nya dan panggil getPostsByCategory(category.id)
  const [posts, recentPosts] = await Promise.all([
    getPostsByCategory(category.id),
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

      {/* Category Header Banner - Industrial Legal Investigation Style */}
      <div className="bg-black text-white border-l-8 border-red-800 border-2 border-black p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-none">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-red-800 text-white rounded-none">
              <Folder className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-red-500 font-mono">
              KATEGORI HUKUM & INVESTIGASI
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight font-serif-heading uppercase text-white">
            {categoryName}
          </h1>
          {category.description && (
            <p className="text-gray-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {category.description}
            </p>
          )}
        </div>
        <div className="bg-zinc-900 border-2 border-black px-5 py-3 text-center shrink-0 rounded-none">
          <p className="text-3xl font-black text-white font-serif-heading">{posts.length}</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest font-mono">Artikel Ditemukan</p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white border-2 border-black p-12 text-center space-y-4 rounded-none">
          <div className="w-16 h-16 bg-red-950 text-red-500 border border-black flex items-center justify-center mx-auto rounded-none">
            <Newspaper className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-black uppercase tracking-tight font-serif-heading">
            Belum Ada Berita Untuk Kategori {categoryName}
          </h3>
          <p className="text-gray-700 text-xs max-w-md mx-auto">
            Silakan kembali ke halaman utama untuk membaca berita dan arsip kriminal terkini lainnya.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-red-800 hover:bg-black text-white font-black text-xs px-5 py-2.5 transition uppercase tracking-wider rounded-none"
          >
            <span>Kembali ke Beranda</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
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
                {posts.length} Berita Terbit
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
