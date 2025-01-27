import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ShillDash - Solana Token Dashboard',
  description: 'Track and manage your favorite Solana tokens',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Navbar />
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
