import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClerkProvider>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
              <Toaster 
                position="top-right"
                toastOptions={{
                  style: {
                    background: 'rgba(10, 15, 31, 0.95)',
                    color: '#fff',
                    border: '1px solid rgba(3, 225, 255, 0.1)',
                  },
                }}
              />
            </div>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
