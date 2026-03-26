
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase';
import { Montserrat, Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeSync } from '@/components/theme-sync';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  variable: '--font-headline',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

export const viewport: Viewport = {
  themeColor: '#005cf1',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'SMKS PGRI 2 KEDONDONG | Sekolah Vokasi Unggulan & Inovatif',
  description: "Situs resmi SMKS PGRI 2 Kedondong. Sekolah vokasi unggulan dengan kurikulum link & match industri. Temukan informasi PPDB Online, Jurusan (TKJ, Multimedia, Akuntansi), berita terbaru, dan prestasi siswa.",
  keywords: "SMK PGRI 2 Kedondong, SMKS PGRI 2 Kedondong, PPDB Online SMK, Sekolah Vokasi Lampung, Jurusan Komputer SMK, Bursa Kerja Khusus SMK",
  openGraph: {
    title: 'SMKS PGRI 2 KEDONDONG',
    description: 'Mencetak lulusan kompeten yang siap kerja, kuliah, dan berwirausaha.',
    type: 'website',
    locale: 'id_ID',
    url: 'https://smkspgri2kedondong.sch.id',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SMKS PGRI 2 KEDONDONG',
    description: 'Mencetak lulusan kompeten yang siap kerja, kuliah, dan berwirausaha.',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={cn("font-body antialiased", montserrat.variable, inter.variable)}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
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
