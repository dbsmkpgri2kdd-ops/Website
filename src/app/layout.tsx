
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeSync } from '@/components/theme-sync';

// Font standar lembaga: Plus Jakarta Sans untuk Headline yang otoritatif
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-headline',
});

// Font standar lembaga: Inter untuk keterbacaan body text yang maksimal
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

export const viewport: Viewport = {
  themeColor: '#0a0c1b',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'SMKS PGRI 2 KEDONDONG | Digital Excellence',
    template: '%s | SMKS PGRI 2 KEDONDONG'
  },
  description: "Official Website SMKS PGRI 2 Kedondong. Pusat Pendidikan Vokasi Berstandar Industri Masa Depan dengan Ekosistem Digital Terpadu.",
  keywords: ["SMK", "PGRI 2 Kedondong", "Kedondong", "Pesawaran", "Lampung", "Vokasi", "Pendidikan", "PPDB 2025", "Sekolah Menengah Kejuruan"],
  authors: [{ name: "SMKS PGRI 2 Kedondong" }],
  creator: "Digital Excellence Team SMKS PGRI 2 Kedondong",
  publisher: "SMKS PGRI 2 Kedondong",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://studio-128676595-62275.web.app/'),
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://studio-128676595-62275.web.app/',
    siteName: 'SMKS PGRI 2 KEDONDONG',
    title: 'SMKS PGRI 2 KEDONDONG | Digital Excellence',
    description: 'Pusat Pendidikan Vokasi Berstandar Industri Masa Depan di Kedondong, Pesawaran.',
    images: [
      {
        url: 'https://picsum.photos/seed/school-og/1200/630',
        width: 1200,
        height: 630,
        alt: 'SMKS PGRI 2 KEDONDONG Digital Hub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SMKS PGRI 2 KEDONDONG | Digital Excellence',
    description: 'Pusat Pendidikan Vokasi Berstandar Industri Masa Depan.',
    images: ['https://picsum.photos/seed/school-twitter/1200/630'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={cn("font-body antialiased", plusJakartaSans.variable, inter.variable)}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <FirebaseClientProvider>
              <ThemeSync />
              {children}
            </FirebaseClientProvider>
            <Toaster />
          </ThemeProvider>
      </body>
    </html>
  );
}
