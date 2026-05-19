import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import GazaBanner from '@/components/GazaBanner';
import SessionProvider from '@/components/SessionProvider';

const dmSans = DM_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'CineMay — Watch Movies & Series Online',
    template: '%s | CineMay',
  },
  description:
    'Stream the latest movies and TV series on CineMay. Trending content, top rated films, and popular shows — all in one place.',
  openGraph: {
    type: 'website',
    siteName: 'CineMay',
    title: 'CineMay — Watch Movies & Series Online',
    description: 'Stream the latest movies and TV series on CineMay.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CineMay',
    description: 'Stream the latest movies and TV series on CineMay.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.className}>
      <body className="bg-[#0a0a0f] text-white min-h-screen">
        <SessionProvider>
          {/* Sticky header: Gaza banner + Navbar stacked together */}
          <div className="sticky top-0 z-50">
            <GazaBanner />
            <Navbar />
          </div>
          <main>{children}</main>
          <footer className="border-t border-white/5 mt-16 py-8 px-4 text-center text-gray-600 text-sm">
            <p>© {new Date().getFullYear()} CineMay. All rights reserved.</p>
            <p className="mt-1 text-xs text-gray-700">
              Powered by Stinson boy.
            </p>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
