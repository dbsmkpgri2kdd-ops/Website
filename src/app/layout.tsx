import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeSync } from '@/components/theme-sync';
import { AIAssistant } from '@/components/ai/ai-assistant';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
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
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />
      </head>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased selection:bg-primary/10",
        jakarta.variable, 
        inter.variable
      )}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={true}
            disableTransitionOnChange
          >
            <FirebaseClientProvider>
              <ThemeSync />
              {children}
              <AIAssistant />
              <PWAInstallPrompt />
            </FirebaseClientProvider>
            <Toaster />
          </ThemeProvider>
      </body>
    </html>
  );
}