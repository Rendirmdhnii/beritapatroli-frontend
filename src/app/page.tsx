import React from 'react';
import Link from 'next/link';
import { 
  Clock, 
  User, 
  Flame, 
  TrendingUp, 
  ArrowRight, 
  Newspaper,
  Calendar,
  Sparkles,
  ChevronRight
} from 'lucide-react';

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
    media.media_details?.sizes?.medium?.source_url ||
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

// Fetch posts from WordPress REST API
async function getWpPosts(): Promise<WpPost[]> {
  try {
    const res = await fetch('https://beritapatroli.co.id/wp-json/wp/v2/posts?_embed', {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Gagal mengambil berita: ${res.status} ${res.statusText}`);
    }

    const posts: WpPost[] = await res.json();
    return posts;
  } catch (error) {
    console.error('Error fetching WordPress posts:', error);
    return [];
  }
}

export default async function HomePage() {
  const posts = await getWpPosts();

  if (!posts || posts.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 border border-gray-200 bg-white p-8">
        <div className="w-16 h-16 bg-red-50 text-[#990000] border border-red-200 rounded-full flex items-center justify-center mx-auto">
          <Newspaper className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#111111] font-serif-heading">Tidak ada berita ditemukan</h2>
        <p className="text-slate-500 text-xs max-w-md mx-auto">
          Gagal memuat berita dari server WordPress REST API. Silakan coba muat ulang halaman beberapa saat lagi.
        </p>
      </div>
    );
  }

  // Layout Asimetris Data Split
  const mainHeadline = posts[0];
  const sideTrending = posts.slice(1, 4);
  const listViewNews = posts.slice(4);
  const sidebarTrending = posts.slice(0, 5);

  return (
    <div className="space-y-8 pb-12">
      
      {/* ================= 1. BAGIAN PALING ATAS: LAYOUT EDITORIAL ASIMETRIS ================= */}
      <section className="space-y-4">
        {/* Header Seksi */}
        <div className="flex items-center justify-between border-b-2 border-[#990000] pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-[#990000] text-white">
              <Flame className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-extrabold text-[#111111] uppercase tracking-tight font-serif-heading">
              Headline Utama Redaksi
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:block">
            Edisi Koran Digital Hari Ini
          </span>
        </div>

        {/* Grid Editorial Asimetris: 70% Kolom Kiri (8 Cols) vs 30% Kolom Kanan (4 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* KOLOM KIRI (70% / 8 COLS): 1 BERITA UTAMA EKSTRA BESAR */}
          {mainHeadline && (
            <div className="lg:col-span-8 group relative bg-white border border-gray-200 overflow-hidden flex flex-col">
              <div className="relative h-[340px] sm:h-[440px] lg:h-[480px] w-full overflow-hidden bg-black">
                {/* Native HTML <img> Tag */}
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
                    Utama
                  </span>
                  <span className="bg-[#111111] text-white text-[11px] font-semibold px-3 py-1 uppercase tracking-wider">
                    {getCategory(mainHeadline)}
                  </span>
                </div>

                {/* Content Overlay */}
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
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight hover:text-red-300 transition line-clamp-2 font-serif-heading">
                      {decodeHtmlEntities(mainHeadline.title.rendered)}
                    </h1>
                  </Link>

                  <p className="text-slate-300 text-sm line-clamp-2 leading-relaxed hidden sm:block">
                    {stripHtmlTags(mainHeadline.excerpt.rendered)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* KOLOM KANAN (30% / 4 COLS): 3 BERITA TRENDING KECIL DITUMPUK VERTIKAL */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111] px-1 flex items-center gap-1.5 font-serif-heading border-b border-gray-200 pb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#990000]" />
              Trending Terkait (30% Kolom Kanan)
            </h3>
            
            <div className="flex-1 flex flex-col justify-between space-y-3">
              {sideTrending.map((news) => (
                <div
                  key={news.id}
                  className="bg-white border border-gray-200 p-3 flex gap-3 hover:border-[#990000] transition group flex-1 items-center"
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-24 overflow-hidden shrink-0 relative bg-gray-100 border border-gray-200">
                    <img
                      src={getThumbnailUrl(news)}
                      alt={decodeHtmlEntities(news.title.rendered)}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>

                  <div className="flex flex-col justify-between flex-1 min-w-0 h-full py-0.5">
                    <div className="space-y-1">
                      <span className="inline-block text-[10px] font-bold text-[#990000] uppercase tracking-wider">
                        {getCategory(news)}
                      </span>
                      <Link href={`/berita/${news.slug}`}>
                        <h4 className="text-xs sm:text-sm font-bold text-[#111111] group-hover:text-[#990000] transition line-clamp-2 leading-snug font-serif-heading">
                          {decodeHtmlEntities(news.title.rendered)}
                        </h4>
                      </Link>
                    </div>

                    <div className="flex items-center text-[11px] text-slate-500 mt-1">
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

      {/* ================= 2. PEMISAH GARIS TEBAL HITAM KHAS KORAN ================= */}
      <div className="relative my-8">
        <div className="border-b-4 border-[#111111] w-full" />
        <div className="absolute -top-3 left-0 bg-[#111111] text-white text-[11px] font-bold px-4 py-1 uppercase tracking-widest font-serif-heading flex items-center gap-2">
          <span className="w-2 h-2 bg-[#990000] inline-block" />
          <span>Daftar Berita Terbaru</span>
        </div>
      </div>

      {/* ================= 3. BAGIAN BAWAH: DESAIN 'LIST VIEW' (GAMBAR KIRI, TEKS KANAN) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
        
        {/* LEFT COLUMN: LIST VIEW NEWS (8 COLS) */}
        <div className="lg:col-span-8 space-y-4">
          {(listViewNews.length > 0 ? listViewNews : posts).map((news) => (
            <article
              key={news.id}
              className="bg-white border border-gray-200 p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center hover:border-[#990000] transition duration-200 group"
            >
              {/* Gambar di Kiri */}
              <div className="w-full sm:w-48 sm:h-36 md:w-56 md:h-36 shrink-0 overflow-hidden border border-gray-200 bg-gray-100 relative">
                <img
                  src={getThumbnailUrl(news)}
                  alt={decodeHtmlEntities(news.title.rendered)}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <span className="absolute top-2 left-2 bg-[#111111] text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                  {getCategory(news)}
                </span>
              </div>

              {/* Teks & Metadata di Kanan */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    {getAuthor(news)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {formatDate(news.date)}
                  </span>
                </div>

                <Link href={`/berita/${news.slug}`}>
                  <h3 className="text-base sm:text-xl font-bold text-[#111111] group-hover:text-[#990000] transition leading-snug line-clamp-2 font-serif-heading">
                    {decodeHtmlEntities(news.title.rendered)}
                  </h3>
                </Link>

                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {stripHtmlTags(news.excerpt.rendered)}
                </p>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <Link
                    href={`/berita/${news.slug}`}
                    className="inline-flex items-center gap-1 text-[#990000] hover:text-[#7a0000] font-bold text-[11px] uppercase tracking-wider hover:gap-2 transition-all"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* RIGHT COLUMN: SIDEBAR (4 COLS) */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#990000] pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#990000]" />
                <h3 className="text-base font-extrabold text-[#111111] uppercase tracking-tight font-serif-heading">
                  Populer Minggu Ini
                </h3>
              </div>
              <span className="text-[10px] font-bold bg-red-100 text-[#990000] px-2 py-0.5 uppercase tracking-wider">
                Top 5
              </span>
            </div>

            <div className="space-y-4">
              {sidebarTrending.map((news, index) => (
                <div key={news.id} className="flex gap-3.5 items-start group border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                  <span className="text-2xl font-black text-slate-300 group-hover:text-[#990000] transition w-6 text-center shrink-0 leading-none font-serif-heading">
                    0{index + 1}
                  </span>
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-[#990000] uppercase tracking-wider">
                      {getCategory(news)}
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
    </div>
  );
}
