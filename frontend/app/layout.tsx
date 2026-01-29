import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/Nav';
import { BackgroundBeams } from '@/components/ui/background-beams';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Parts Platform | Identify, Inventory & Invoice',
  description: 'AI-based parts identification and inventory system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth dark ${inter.variable}`}>
      <body className={`min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans ${inter.className}`}>
        <BackgroundBeams className="opacity-40" />
        <header className="sticky top-0 z-50 border-b border-slate-700/50 bg-slate-950/90 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl font-bold tracking-tight text-white">
                Parts Platform
              </h1>
              <Nav />
            </div>
          </div>
        </header>
        <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
