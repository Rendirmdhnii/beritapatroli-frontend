import { 
  Landmark, 
  TrendingUp, 
  Globe, 
  Trophy, 
  Scale, 
  Flame,
  Building2,
  ShieldAlert,
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
  { name: 'Berita Nasional', href: '/kategori/berita-nasional', slug: 'berita-nasional', icon: Landmark },
  { name: 'Investigasi', href: '/kategori/kejahatan', slug: 'kejahatan', icon: ShieldAlert },
  { name: 'Daerah', href: '/kategori/nusantara', slug: 'nusantara', icon: Building2 },
  { name: 'Ekonomi', href: '/kategori/ekonomi', slug: 'ekonomi', icon: TrendingUp },
  { name: 'Internasional', href: '/kategori/internasional', slug: 'internasional', icon: Globe },
  { name: 'Olahraga', href: '/kategori/olahraga', slug: 'olahraga', icon: Trophy },
];
