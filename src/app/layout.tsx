import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-serif',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Berita Patroli - Portal Berita Terpercaya & Tepat Akurat',
  description: 'Portal berita independen menyajikan informasi Berita Nasional, Ekonomi, Internasional, Olahraga, serta Hukum dan Kriminal secara aktual dan terpercaya.',
  keywords: ['berita patroli', 'berita nasional', 'hukum dan kriminal', 'ekonomi', 'internasional', 'olahraga', 'portal berita indonesia'],
  authors: [{ name: 'Redaksi Berita Patroli' }],
  openGraph: {
    title: 'Berita Patroli - Portal Berita Terpercaya & Tepat Akurat',
    description: 'Menyajikan berita terkini hukum, kriminal, nasional, ekonomi, internasional, dan olahraga.',
    type: 'website',
    locale: 'id_ID',
    siteName: 'Berita Patroli',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans bg-white text-slate-900 min-h-screen flex flex-col antialiased selection:bg-red-800 selection:text-white">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
