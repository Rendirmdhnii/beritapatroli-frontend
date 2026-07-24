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
  icon?: LucideIcon;
}

export const categories: CategoryItem[] = [
  { name: 'JATIM', href: '/kategori/84', icon: Flame },
  { name: 'Hukum & Kriminal', href: '/kategori/6', icon: Scale },
  { name: 'Berita Nasional', href: '/kategori/nasional', icon: Landmark },
  { name: 'Ekonomi', href: '/kategori/ekonomi', icon: TrendingUp },
  { name: 'Internasional', href: '/kategori/internasional', icon: Globe },
  { name: 'Olahraga', href: '/kategori/olahraga', icon: Trophy },
];
