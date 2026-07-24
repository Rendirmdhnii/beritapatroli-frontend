export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  category: 'Berita Nasional' | 'Ekonomi' | 'Internasional' | 'Olahraga' | 'Hukum dan Kriminal';
  imageUrl: string;
  author: string;
  publishedAt: string;
  readTime: string;
  isHeadline?: boolean;
  isSideHeadline?: boolean;
  isTrending?: boolean;
  viewsCount?: number;
}
