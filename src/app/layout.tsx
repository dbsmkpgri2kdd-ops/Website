
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase';
import { Belleza, Alegreya } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeSync } from '@/components/theme-sync';

// Font standar lembaga sesuai PRD
const belleza = Belleza({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-headline',
});

const alegreya = Alegreya({
  subsets: ['latin'],
  variable: '--font-body',
});

export const viewport: Viewport = {
  themeColor: '#386641',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'SmartSchool App | Digital Excellence',
    template: '%s | SmartSchool App'
  },
  description: "Official Website SMKS PGRI 2 Kedondong. Pusat Pendidikan Vokasi Berstandar Industri Masa Depan dengan Ekosistem Digital Terpadu.",
  keywords: ["SMK", "PGRI 2 Kedondong", "Kedondong", "Pesawaran", "Lampung", "Vokasi", "Pendidikan", "PPDB 2025", "Sekolah Menengah Kejuruan"],
  authors: [{ name: "SMKS PGRI 2 Kedondong" }],
  creator: "Digital Excellence Team SMKS PGRI 2 Kedondong",
  publisher: "SMKS PGRI 2 Kedondong",
  metadataBase: new URL('https://studio-128676595-62275.web.app/'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={cn("font-body antialiased", belleza.variable, alegreya.variable)}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
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
