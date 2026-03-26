import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase';
import { Belleza, Alegreya } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeSync } from '@/components/theme-sync';

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
  title: 'SMKS PGRI 2 KEDONDONG | Sekolah Vokasi Unggulan',
  description: "Situs resmi SMKS PGRI 2 Kedondong. Pendidikan vokasi berbasis industri.",
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