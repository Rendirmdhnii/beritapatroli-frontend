'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

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
    media.media_details?.sizes?.full?.source_url ||
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

interface HeadlineCarouselProps {
  posts: WpPost[];
}

export default function HeadlineCarousel({ posts }: HeadlineCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const topPosts = posts.slice(0, 5);

  useEffect(() => {
    if (topPosts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % topPosts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [topPosts.length]);

  if (!topPosts || topPosts.length === 0) return null;

  const currentPost = topPosts[currentIndex];

  return (
    <section className="max-w-6xl mx-auto w-full relative overflow-hidden h-[300px] md:h-[450px] lg:h-[500px] my-6 bg-black border-2 border-black rounded-none">
      <div className="relative w-full h-full">
        {/* Background Images with smooth fade transition */}
        {topPosts.map((post, idx) => (
          <div
            key={post.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'
            }`}
          >
            <img
              src={getThumbnailUrl(post)}
              alt={decodeHtmlEntities(post.title.rendered)}
              className="w-full h-full object-cover object-center opacity-90 rounded-none"
            />
          </div>
        ))}

        {/* Gradient Overlay for photo clarity */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-1" />

        {/* Top Badges (Tanpa ikon Flame/hiasan alay, bersih profesional) */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-wrap gap-2 z-10">
          <span className="bg-red-800 text-white text-xs font-black px-3 py-1 uppercase tracking-widest rounded-none border border-red-600">
            LAPORAN UTAMA &amp; KASUS MENONJOL
          </span>
          <span className="bg-black/90 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-none border border-zinc-700">
            {getCategory(currentPost)}
          </span>
        </div>

        {/* Navigation Arrows */}
        <div className="absolute top-1/2 -translate-y-1/2 inset-x-4 flex justify-between z-20 pointer-events-none">
          <button
            onClick={() => setCurrentIndex((prev) => (prev === 0 ? topPosts.length - 1 : prev - 1))}
            className="pointer-events-auto p-2 bg-black/60 hover:bg-red-800 text-white transition rounded-none border border-zinc-700"
            aria-label="Previous Headline"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % topPosts.length)}
            className="pointer-events-auto p-2 bg-black/60 hover:bg-red-800 text-white transition rounded-none border border-zinc-700"
            aria-label="Next Headline"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Content Overlay - Title & Excerpt */}
        <div className="absolute bottom-6 sm:bottom-8 inset-x-0 p-6 sm:p-8 lg:p-10 space-y-2 z-10 max-w-5xl">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-gray-300 uppercase tracking-widest">
            <span className="flex items-center gap-1.5 font-bold text-red-500">
              <User className="w-4 h-4" />
              {getAuthor(currentPost)}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              {formatDate(currentPost.date)}
            </span>
          </div>

          <Link href={`/berita/${currentPost.slug}`} className="block group">
            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight hover:text-red-400 transition font-serif-heading uppercase line-clamp-2">
              {decodeHtmlEntities(currentPost.title.rendered)}
            </h1>
          </Link>

          <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed max-w-4xl font-normal hidden sm:block border-l-2 border-red-800 pl-3 bg-black/40 py-1 font-sans">
            {stripHtmlTags(currentPost.excerpt.rendered)}
          </p>
        </div>

        {/* Dots Indicator Sakti - Always Visible on All Devices (HP & Desktop) */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-50">
          {topPosts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={
                index === currentIndex
                  ? 'w-3 h-3 bg-red-600 rounded-full transition-all border border-red-500 cursor-pointer'
                  : 'w-3 h-3 bg-white/50 hover:bg-white rounded-full transition-all border border-black/30 cursor-pointer'
              }
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
