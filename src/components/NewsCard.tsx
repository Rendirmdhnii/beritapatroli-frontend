import React from 'react';
import Link from 'next/link';
import { User, Calendar, Eye } from 'lucide-react';

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
  return category ? decodeHtmlEntities(category) : 'Berita';
}

export function getAuthor(post: WpPost): string {
  const author = post._embedded?.['author']?.[0]?.name;
  return author ? decodeHtmlEntities(author) : 'Redaksi';
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
  const category = fallbackCategory || getCategory(post);
  const author = getAuthor(post);
  const formattedDate = formatDate(post.date);
  const views = getViewsCount(post.id);
  const thumbnailUrl = getThumbnailUrl(post);

  return (
    <article className="border-b border-gray-200 pb-4 mb-4 flex flex-col sm:flex-row gap-4 items-start group">
      {/* Thumbnail Gambar */}
      <div className="w-full sm:w-48 aspect-video shrink-0 bg-black overflow-hidden relative rounded-none">
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full aspect-video object-cover group-hover:scale-105 transition duration-500 opacity-95"
        />
        <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 uppercase tracking-wider rounded-none">
          {category}
        </span>
      </div>

      {/* Konten Berita */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Metadata Penulis, Tanggal, dan Views */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] md:text-xs text-gray-500 mb-2 mt-2 font-medium uppercase">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3 text-red-600" />
            {author}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-red-600" />
            {formattedDate}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-red-600" />
            <span>{views} DILIHAT</span>
          </span>
        </div>

        {/* Judul Berita */}
        <Link href={`/berita/${post.slug}`}>
          <h3 className="text-base md:text-xl font-bold leading-snug hover:text-red-600 transition-colors">
            {title}
          </h3>
        </Link>

        {/* Deskripsi Singkat (Excerpt) */}
        <p className="text-sm text-gray-600 line-clamp-2 mt-1 leading-relaxed font-sans">
          {excerpt}
        </p>
      </div>
    </article>
  );
}
