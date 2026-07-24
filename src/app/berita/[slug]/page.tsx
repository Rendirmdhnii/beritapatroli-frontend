import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { 
  Calendar, 
  Share2, 
  ChevronRight, 
  Flame, 
  ArrowLeft,
  User,
  Eye,
  MessageCircle,
  Link2
} from 'lucide-react';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
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
  content: {
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
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB';
  } catch {
    return dateString;
  }
}

function getThumbnailUrl(post: WpPost): string {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  if (!media) {
    return 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80';
  }
  return (
    media.media_details?.sizes?.full?.source_url ||
    media.source_url ||
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80'
  );
}

function getCategory(post: WpPost): string {
  const category = post._embedded?.['wp:term']?.[0]?.[0]?.name;
  return category ? decodeHtmlEntities(category) : 'Berita';
}

function getAuthor(post: WpPost): string {
  const author = post._embedded?.['author']?.[0]?.name;
  return author ? decodeHtmlEntities(author) : 'Redaksi Berita Patroli';
}

function getViewsCount(id: number): string {
  const views = ((id * 47 + 789) % 4500) + 500;
  return views.toLocaleString('id-ID');
}

// Fetch single post by slug from WordPress REST API (real-time no-store)
async function getWpPostBySlug(slug: string): Promise<WpPost | null> {
  try {
    const res = await fetch(
      `https://beritapatroli.co.id/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed`,
      { cache: 'no-store' }
    );

    if (!res.ok) {
      return null;
    }

    const posts: WpPost[] = await res.json();
    return posts && posts.length > 0 ? posts[0] : null;
  } catch (error) {
    console.error('Error fetching WP post by slug:', error);
    return null;
  }
}

// Fetch recent posts for sidebar & recommendations
async function getRecentWpPosts(currentSlug: string): Promise<WpPost[]> {
  try {
    const res = await fetch('https://beritapatroli.co.id/wp-json/wp/v2/posts?_embed&per_page=6', {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const posts: WpPost[] = await res.json();
    return posts.filter((p) => p.slug !== currentSlug);
  } catch {
    return [];
  }
}

// Generate Dynamic SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getWpPostBySlug(slug);

  if (!post) {
    return {
      title: 'Berita Tidak Ditemukan - Berita Patroli',
    };
  }

  const title = decodeHtmlEntities(post.title.rendered);
  const excerpt = stripHtmlTags(post.excerpt.rendered);
  const imageUrl = getThumbnailUrl(post);

  return {
    title: `${title} - Berita Patroli`,
    description: excerpt,
    openGraph: {
      title,
      description: excerpt,
      type: 'article',
      images: [imageUrl],
      publishedTime: post.date,
      authors: [getAuthor(post)],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: excerpt,
      images: [imageUrl],
    },
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getWpPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const recentPosts = await getRecentWpPosts(slug);
  const title = decodeHtmlEntities(post.title.rendered);
  const category = getCategory(post);
  const author = getAuthor(post);
  const formattedDate = formatDate(post.date);
  const thumbnailUrl = getThumbnailUrl(post);

  // 1. Bersihkan Kode HTML WordPress (Regex Stripper width, height, & style)
  let cleanContent = (post.content?.rendered || '')
    .replace(/width="[^"]*"/gi, '')
    .replace(/height="[^"]*"/gi, '')
    .replace(/style="[^"]*"/gi, '');

  return (
    <div className="space-y-8 pb-16 font-sans w-full max-w-full overflow-x-hidden">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-gray-500 overflow-x-auto pb-1 max-w-5xl mx-auto px-4 w-full">
        <Link href="/" className="hover:text-red-800 font-bold transition shrink-0">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="hover:text-red-800 font-bold transition shrink-0">
          {category}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="text-black font-black truncate max-w-xs sm:max-w-md">
          {title}
        </span>
      </nav>

      {/* Main Grid: Article Column & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start max-w-7xl mx-auto px-0 md:px-4 w-full max-w-full">
        
        {/* ================= MAIN ARTICLE ================= */}
        <article className="lg:col-span-8 bg-white border-0 md:border-2 md:border-black space-y-6 max-w-3xl mx-auto w-full max-w-full rounded-none px-4 md:px-8 py-2 md:py-8">
          
          {/* 1. Kategori Badge */}
          <div>
            <span className="bg-red-800 text-white text-xs font-black px-3 py-1 uppercase tracking-widest rounded-none border border-black inline-block">
              {category}
            </span>
          </div>

          {/* 2. Judul Sangat Besar di Paling Atas */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-black leading-tight tracking-tight font-serif-heading uppercase">
            {title}
          </h1>

          {/* 3. Meta Data Rapi (Penulis, Tanggal, & Views) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-y-2 border-black text-xs font-mono text-gray-700 uppercase tracking-wider my-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-black text-xs uppercase font-serif-heading shrink-0 rounded-none">
                {author.charAt(0)}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="font-black text-black">{author}</span>
                <span className="text-red-800 font-bold text-[11px]">• TIM REDAKSI</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-700">
              <div className="flex items-center gap-1.5 font-bold">
                <Calendar className="w-3.5 h-3.5 text-red-800" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-gray-900">
                <Eye className="w-3.5 h-3.5 text-red-800" />
                <span>{getViewsCount(post.id)} dilihat</span>
              </div>
            </div>
          </div>

          {/* 4. Gambar Utama Selebar Penuh (w-full h-auto object-cover max-h-[400px]) */}
          {thumbnailUrl && (
            <div className="space-y-2 my-6">
              <div className="relative w-full border-2 border-black overflow-hidden bg-black rounded-none">
                <img
                  src={thumbnailUrl}
                  alt={title}
                  className="w-full h-auto object-cover max-h-[400px] rounded-none"
                />
              </div>
              <p className="text-[11px] text-gray-500 italic text-center font-mono">
                Dokumentasi / Foto Berita Patroli
              </p>
            </div>
          )}

          {/* Clean Share Bar: Minimalist Icon-Only Buttons */}
          <div className="bg-black text-white border-2 border-black p-3 flex items-center justify-between gap-3 text-xs rounded-none my-4">
            <span className="font-black uppercase tracking-widest flex items-center gap-1.5 font-mono text-red-400">
              <Share2 className="w-4 h-4 text-red-500" />
              Bagikan Berita:
            </span>
            
            {/* Deretan Ikon-Sahaja Minimalis & UX-Friendly (WhatsApp, Facebook, Twitter, Link) */}
            <div className="flex items-center gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + post.link)}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Bagikan ke WhatsApp"
                title="Bagikan ke WhatsApp"
                className="w-9 h-9 bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center transition rounded-none border border-emerald-600 shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(post.link)}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Bagikan ke Facebook"
                title="Bagikan ke Facebook"
                className="w-9 h-9 bg-blue-800 hover:bg-blue-900 text-white flex items-center justify-center transition rounded-none border border-blue-700 shrink-0"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(post.link)}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Bagikan ke Twitter"
                title="Bagikan ke Twitter / X"
                className="w-9 h-9 bg-zinc-900 hover:bg-red-800 text-white flex items-center justify-center transition rounded-none border border-zinc-700 shrink-0"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + post.link)}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Bagikan Berita"
                title="Salin / Bagikan Link Berita"
                className="w-9 h-9 bg-red-800 hover:bg-black text-white flex items-center justify-center transition rounded-none border border-red-700 shrink-0"
              >
                <Link2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* 5. JURUS PAMUNGKAS SAKTI CSS MURNI & WP-CONTENT DIV */}
          <style>{`
            .wp-content { max-width: 100vw !important; overflow-x: hidden !important; }
            .wp-content * { max-width: 100% !important; box-sizing: border-box !important; }
            .wp-content img, .wp-content figure, .wp-content video, .wp-content iframe {
              max-width: 100% !important;
              width: 100% !important;
              height: auto !important;
              object-fit: contain !important;
              margin: 1.5rem auto !important;
              display: block !important;
            }
          `}</style>
          <div
            className="w-full max-w-[100vw] overflow-x-hidden px-4 md:px-0 break-words whitespace-pre-wrap wp-content text-base md:text-lg text-gray-800 leading-loose [&_p]:mb-6 font-sans pt-4"
            dangerouslySetInnerHTML={{ __html: cleanContent }}
          />

          {/* Navigation Back */}
          <div className="pt-6 border-t-2 border-black flex justify-between items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-black text-black hover:text-red-800 transition uppercase tracking-wider font-mono"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </Link>
          </div>
        </article>

        {/* ================= SIDEBAR (DESKTOP ONLY: HIDDEN ON MOBILE) ================= */}
        <aside className="hidden lg:block lg:col-span-4 space-y-6">
          <div className="bg-white border-2 border-black p-5 space-y-4 rounded-none">
            <div className="flex items-center justify-between border-b-2 border-red-800 pb-2">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-800" />
                <h3 className="text-base font-black text-black uppercase tracking-tight font-serif-heading">
                  Berita Terkini
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              {recentPosts.slice(0, 5).map((item, index) => (
                <div key={item.id} className="flex gap-3.5 items-start group border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                  <span className="text-2xl font-black text-gray-400 group-hover:text-red-800 transition w-6 text-center shrink-0 font-serif-heading leading-none">
                    0{index + 1}
                  </span>
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="text-[10px] font-black text-red-800 uppercase tracking-wider font-mono">
                      {getCategory(item)}
                    </span>
                    <Link href={`/berita/${item.slug}`}>
                      <h4 className="text-xs sm:text-sm font-black text-black group-hover:text-red-800 transition line-clamp-2 leading-snug font-serif-heading uppercase">
                        {decodeHtmlEntities(item.title.rendered)}
                      </h4>
                    </Link>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono">
                      <span>{formatDate(item.date)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>

      {/* Recommendations Section (Visible on both desktop & mobile) */}
      {recentPosts.length > 0 && (
        <section className="pt-10 border-t-2 border-black space-y-4 max-w-7xl mx-auto px-4 font-sans w-full max-w-full">
          <div className="flex items-center gap-2">
            <span className="w-3 h-5 bg-red-800 inline-block" />
            <h3 className="text-xl font-black text-black uppercase tracking-tight font-serif-heading">
              Rekomendasi Berita Lainnya
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {recentPosts.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                href={`/berita/${item.slug}`}
                className="bg-white border-2 border-black hover:border-red-800 transition group flex flex-col rounded-none"
              >
                <div className="h-40 w-full overflow-hidden bg-black border-b-2 border-black relative rounded-none">
                  <img
                    src={getThumbnailUrl(item)}
                    alt={decodeHtmlEntities(item.title.rendered)}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 rounded-none"
                  />
                </div>
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-red-800 uppercase tracking-wider font-mono">
                      {getCategory(item)}
                    </span>
                    <h4 className="text-sm font-black text-black group-hover:text-red-800 transition line-clamp-2 leading-snug font-serif-heading uppercase">
                      {decodeHtmlEntities(item.title.rendered)}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600 pt-2 border-t border-gray-200 font-mono">
                    {formatDate(item.date)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
