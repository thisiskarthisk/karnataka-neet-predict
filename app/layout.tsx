import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NEET Rank & College Predictor | AIQ Cutoff Data',
  description: 'Predict your NEET rank and find eligible government MBBS colleges across India using real 2025 AIQ cutoff data from 397+ colleges.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
