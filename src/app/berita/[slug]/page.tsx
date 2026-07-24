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
  User
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
    <div className="space-y-8 pb-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto pb-1 max-w-5xl mx-auto">
        <Link href="/" className="hover:text-[#990000] font-semibold transition shrink-0">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="hover:text-[#990000] font-semibold transition shrink-0">
          {category}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-900 font-medium truncate max-w-xs sm:max-w-md">
          {title}
        </span>
      </nav>

      {/* Main Grid: Article Column (8 Cols desktop, max-w-3xl reading width) & Sidebar (4 Cols desktop, HIDDEN on mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start max-w-7xl mx-auto">
        
        {/* ================= MAIN ARTICLE (MEDIUM.COM STYLE: MAX-W-3XL) ================= */}
        <article className="lg:col-span-8 bg-white border border-gray-200 p-6 sm:p-10 space-y-6 max-w-3xl mx-auto w-full">
          
          {/* 1. Kategori Badge */}
          <div>
            <span className="bg-[#990000] text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">
              {category}
            </span>
          </div>

          {/* 2. Judul Sangat Besar di Paling Atas (Playfair Display Serif) */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111111] leading-tight tracking-tight font-serif-heading">
            {title}
          </h1>

          {/* 3. Meta Data Berukuran Kecil (Penulis & Tanggal) */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-gray-200 text-xs text-slate-500">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#111111] text-white flex items-center justify-center font-bold text-xs uppercase font-serif-heading shrink-0">
                {author.charAt(0)}
              </div>
              <div>
                <span className="font-bold text-[#111111]">{author}</span>
                <span className="text-slate-400 text-[11px] ml-1.5">• Tim Redaksi</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 font-medium text-slate-500 text-xs">
              <Calendar className="w-3.5 h-3.5 text-[#990000]" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* 4. Gambar Utama Selebar Penuh (w-full) di Bawah Judul & Meta */}
          {thumbnailUrl && (
            <div className="space-y-2">
              <div className="relative w-full h-[300px] sm:h-[450px] border border-gray-200 overflow-hidden bg-black">
                <img
                  src={thumbnailUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-slate-500 italic text-center font-serif">
                Dokumentasi / Foto Berita Patroli
              </p>
            </div>
          )}

          {/* Share Bar */}
          <div className="bg-gray-50 border border-gray-200 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-serif-heading">
              <Share2 className="w-4 h-4 text-[#990000]" />
              Bagikan Berita:
            </span>
            <div className="flex items-center gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(title)}`}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 font-semibold transition flex items-center gap-1"
              >
                <span>WhatsApp</span>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(post.link)}`}
                target="_blank"
                rel="noreferrer"
                className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 font-semibold transition"
              >
                <span>Facebook</span>
              </a>
            </div>
          </div>

          {/* 5. Isi Berita (Font Size text-lg & leading-relaxed ala Medium.com) */}
          <div
            className="article-content prose prose-slate max-w-none text-lg leading-relaxed text-slate-800 prose-p:text-lg prose-p:leading-relaxed prose-p:text-slate-800 prose-a:text-[#990000] hover:prose-a:underline prose-headings:font-bold prose-headings:text-[#111111] font-sans pt-2"
            dangerouslySetInnerHTML={{ __html: post.content?.rendered || '' }}
          />

          {/* Disclaimer & Editor Footer */}
          <div className="bg-gray-50 border-l-4 border-[#990000] border-y border-r border-gray-200 p-4 text-xs text-slate-600 space-y-1 mt-8">
            <p className="font-bold text-[#111111] uppercase tracking-wider font-serif-heading">Pedoman Hak Cipta & Disclaimer Redaksi:</p>
            <p>
              Seluruh isi berita dilaporkan sesuai fakta dan pedoman pers independen. Dilarang mengutip atau mendistribusikan ulang tanpa mencantumkan sumber resmi <strong>Berita Patroli</strong>.
            </p>
          </div>

          {/* Navigation Back */}
          <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-[#990000] transition uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </Link>
          </div>
        </article>

        {/* ================= SIDEBAR (DESKTOP ONLY: HIDDEN ON MOBILE) ================= */}
        <aside className="hidden lg:block lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#990000] pb-2">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#990000]" />
                <h3 className="text-base font-extrabold text-[#111111] uppercase tracking-tight font-serif-heading">
                  Berita Terkini
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              {recentPosts.slice(0, 5).map((item, index) => (
                <div key={item.id} className="flex gap-3 items-start group border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                  <span className="text-xl font-black text-slate-300 group-hover:text-[#990000] transition w-5 shrink-0 font-serif-heading">
                    0{index + 1}
                  </span>
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-[#990000] uppercase">
                      {getCategory(item)}
                    </span>
                    <Link href={`/berita/${item.slug}`}>
                      <h4 className="text-xs sm:text-sm font-bold text-[#111111] group-hover:text-[#990000] transition line-clamp-2 leading-snug font-serif-heading">
                        {decodeHtmlEntities(item.title.rendered)}
                      </h4>
                    </Link>
                    <p className="text-[11px] text-slate-400">{formatDate(item.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>

      {/* Recommendations Section (Visible on both desktop & mobile) */}
      {recentPosts.length > 0 && (
        <section className="pt-8 border-t border-gray-200 space-y-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-5 bg-[#990000]" />
            <h3 className="text-xl font-extrabold text-[#111111] uppercase tracking-tight font-serif-heading">
              Rekomendasi Berita Lainnya
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {recentPosts.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                href={`/berita/${item.slug}`}
                className="bg-white border border-gray-200 hover:border-[#990000] transition group flex flex-col"
              >
                <div className="h-40 w-full overflow-hidden bg-gray-100 border-b border-gray-200 relative">
                  <img
                    src={getThumbnailUrl(item)}
                    alt={decodeHtmlEntities(item.title.rendered)}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#990000] uppercase">
                      {getCategory(item)}
                    </span>
                    <h4 className="text-sm font-bold text-[#111111] group-hover:text-[#990000] transition line-clamp-2 leading-snug font-serif-heading">
                      {decodeHtmlEntities(item.title.rendered)}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 pt-2 border-t border-gray-100">
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
