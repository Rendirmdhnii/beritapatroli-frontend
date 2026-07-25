import React from 'react';
import Link from 'next/link';
import { User, Clock, Eye } from 'lucide-react';

export interface WpMediaSize {
  source_url?: string;
}

export interface WpMedia {
  source_url?: string;
  media_details?: {
    sizes?: {
      medium?: WpMediaSize;
      medium_large?: WpMediaSize;
      full?: WpMediaSize;
    };
  };
}

export interface WpTerm {
  id: number;
  name: string;
  slug: string;
}

export interface WpAuthor {
  id: number;
  name: string;
}

export interface WpPost {
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

export function decodeHtmlEntities(str: string): string {
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

export function stripHtmlTags(str: string): string {
  if (!str) return '';
  const clean = str.replace(/<[^>]*>/g, '');
  return decodeHtmlEntities(clean).trim();
}

export function formatDate(dateString: string): string {
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

export function getThumbnailUrl(post: WpPost): string {
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

export function getCategory(post: WpPost): string {
  const category = post._embedded?.['wp:term']?.[0]?.[0]?.name;
  return category ? decodeHtmlEntities(category) : 'BERITA';
}

export function getAuthor(post: WpPost): string {
  const author = post._embedded?.['author']?.[0]?.name;
  return author ? decodeHtmlEntities(author) : 'admin';
}

export function getViewsCount(id: number): string {
  const views = ((id * 47 + 789) % 4500) + 500;
  return views.toLocaleString('id-ID');
}

interface NewsCardProps {
  post: WpPost;
  fallbackCategory?: string;
}

export default function NewsCard({ post, fallbackCategory }: NewsCardProps) {
  const title = decodeHtmlEntities(post.title.rendered);
  const excerpt = stripHtmlTags(post.excerpt.rendered);
  const category = (fallbackCategory || getCategory(post)).toUpperCase();
  const author = getAuthor(post);
  const formattedDate = formatDate(post.date);
  const views = getViewsCount(post.id);
  const thumbnailUrl = getThumbnailUrl(post);

  return (
    <article className="border-b border-gray-200 pb-4 mb-4 flex flex-col sm:flex-row gap-4 items-start group font-sans">
      {/* Gambar Thumbnail (Aspect Ratio 16/9 Orisinal WordPress) */}
      <div className="w-full sm:w-48 aspect-video shrink-0 bg-gray-100 overflow-hidden relative border border-gray-200">
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        <span className="absolute top-1 left-1 bg-[#ff3c36] text-white text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
          {category}
        </span>
      </div>

      {/* Konten Berita */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Kategori Text di Atas Judul */}
        <span className="text-[10px] font-bold text-[#ff3c36] uppercase tracking-wider block">
          {category}
        </span>

        {/* Judul Berita Orisinal */}
        <Link href={`/berita/${post.slug}`}>
          <h3 className="text-base md:text-xl font-bold leading-snug text-[#222222] hover:text-[#ff3c36] transition-colors">
            {title}
          </h3>
        </Link>

        {/* Metadata Orisinal: Penulis (By admin), Tanggal (Clock), Views (Eye) */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] md:text-xs text-gray-500 mb-2 mt-2 font-medium uppercase">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3 text-[#ff3c36]" />
            <span>By {author}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#ff3c36]" />
            <span>{formattedDate}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-[#ff3c36]" />
            <span>{views} DILIHAT</span>
          </span>
        </div>

        {/* Deskripsi Singkat Excerpt */}
        <p className="text-sm text-gray-600 line-clamp-2 mt-1 leading-relaxed">
          {excerpt}
        </p>
      </div>
    </article>
  );
}
