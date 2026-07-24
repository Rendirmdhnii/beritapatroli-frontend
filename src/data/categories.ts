import { 
  Landmark, 
  TrendingUp, 
  Globe, 
  Trophy, 
  Scale, 
  Flame,
  LucideIcon 
} from 'lucide-react';

export interface CategoryItem {
  name: string;
  href: string;
  slug: string;
  icon?: LucideIcon;
}

export const categories: CategoryItem[] = [
  { name: 'JATIM', href: '/kategori/jatim', slug: 'jatim', icon: Flame },
  { name: 'Hukum & Kriminal', href: '/kategori/hukum-dan-kriminal', slug: 'hukum-dan-kriminal', icon: Scale },
  { name: 'Berita Nasional', href: '/kategori/nasional', slug: 'nasional', icon: Landmark },
  { name: 'Ekonomi', href: '/kategori/ekonomi', slug: 'ekonomi', icon: TrendingUp },
  { name: 'Internasional', href: '/kategori/internasional', slug: 'internasional', icon: Globe },
  { name: 'Olahraga', href: '/kategori/olahraga', slug: 'olahraga', icon: Trophy },
];
