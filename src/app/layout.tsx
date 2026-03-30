
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase';
import { Plus_Jakarta_Sans, Belleza, Alegreya } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeSync } from '@/components/theme-sync';
import { AIAssistant } from '@/components/ai/ai-assistant';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
});

const belleza = Belleza({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-belleza',
});

const alegreya = Alegreya({
  subsets: ['latin'],
  variable: '--font-alegreya',
});

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'SMKS PGRI 2 Kedondong | Digital Hub Enterprise',
    template: '%s | SmartSchool'
  },
  description: "Official Website SMKS PGRI 2 Kedondong. Pusat Pendidikan Vokasi Berstandar Industri Masa Depan dengan Ekosistem Digital Terpadu.",
  keywords: ["SMK", "PGRI 2 Kedondong", "Vokasi", "Pendidikan", "PPDB 2025"],
  authors: [{ name: "SMKS PGRI 2 Kedondong" }],
  creator: "Digital Excellence Team",
  metadataBase: new URL('https://studio-128676595-62275.web.app/'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className="dark">
      <body className={cn("font-sans antialiased", jakarta.variable, belleza.variable, alegreya.variable)}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <FirebaseClientProvider>
              <ThemeSync />
              {children}
              <AIAssistant />
            </FirebaseClientProvider>
            <Toaster />
          </ThemeProvider>
      </body>
    </html>
  );
}
