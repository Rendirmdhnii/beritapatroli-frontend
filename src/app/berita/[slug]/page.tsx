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
  Eye
} from 'lucide-react';

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

// Fetch single post by slug from WordPress REST API
async function getWpPostBySlug(slug: string): Promise<WpPost | null> {
  try {
    const res = await fetch(
      `https://beritapatroli.co.id/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed`,
      { next: { revalidate: 60 } }
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
      next: { revalidate: 60 },
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

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-gray-500 overflow-x-auto pb-1 max-w-5xl mx-auto px-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start max-w-7xl mx-auto px-2 sm:px-4">
        
        {/* ================= MAIN ARTICLE ================= */}
        <article className="lg:col-span-8 bg-white border-2 border-black p-4 sm:p-8 md:p-10 space-y-6 max-w-3xl mx-auto w-full rounded-none">
          
          {/* 1. Kategori Badge */}
          <div>
            <span className="bg-red-800 text-white text-xs font-black px-3 py-1 uppercase tracking-widest rounded-none border border-black">
              {category}
            </span>
          </div>

          {/* 2. Judul Sangat Besar di Paling Atas */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-black leading-tight tracking-tight font-serif-heading uppercase">
            {title}
          </h1>

          {/* 3. Meta Data (Penulis, Tanggal, & Views) */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y-2 border-black text-xs font-mono text-gray-700 uppercase tracking-wider">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-black text-white flex items-center justify-center font-black text-xs uppercase font-serif-heading shrink-0 rounded-none">
                {author.charAt(0)}
              </div>
              <div>
                <span className="font-black text-black">{author}</span>
                <span className="text-red-800 font-bold text-[11px] ml-1.5">• TIM REDAKSI</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 font-bold text-gray-700">
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
            <div className="space-y-2">
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

          {/* Share Bar */}
          <div className="bg-black text-white border-2 border-black p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs rounded-none">
            <span className="font-black uppercase tracking-widest flex items-center gap-1.5 font-mono text-red-400">
              <Share2 className="w-4 h-4 text-red-500" />
              Bagikan Berita:
            </span>
            <div className="flex items-center gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(title)}`}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 font-bold uppercase tracking-wider transition rounded-none text-[11px]"
              >
                <span>WhatsApp</span>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(post.link)}`}
                target="_blank"
                rel="noreferrer"
                className="bg-blue-800 hover:bg-blue-900 text-white px-3 py-1.5 font-bold uppercase tracking-wider transition rounded-none text-[11px]"
              >
                <span>Facebook</span>
              </a>
            </div>
          </div>

          {/* 5. Isi Berita (Kontainer ketat anti-tumpah & Tipografi HP Friendly) */}
          <div
            className="article-content w-full max-w-full overflow-hidden break-words whitespace-pre-wrap [&_img]:max-w-full [&_img]:h-auto [&_img]:object-contain [&_iframe]:max-w-full [&_figure]:max-w-full text-base sm:text-lg leading-relaxed text-black font-sans pt-2 space-y-4"
            dangerouslySetInnerHTML={{ __html: post.content?.rendered || '' }}
          />

          {/* Disclaimer & Editor Footer */}
          <div className="bg-zinc-100 border-l-8 border-red-800 border-2 border-black p-4 text-xs text-gray-800 space-y-1.5 mt-8 rounded-none font-sans">
            <p className="font-black text-black uppercase tracking-wider font-mono">Pedoman Pers & Disclaimer Redaksi:</p>
            <p className="leading-relaxed">
              Seluruh isi berita dilaporkan sesuai fakta dan pedoman pers independen. Dilarang mengutip atau mendistribusikan ulang tanpa mencantumkan sumber resmi <strong>Berita Patroli</strong>.
            </p>
          </div>

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
        <section className="pt-10 border-t-2 border-black space-y-4 max-w-7xl mx-auto px-2 sm:px-4 font-sans">
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
