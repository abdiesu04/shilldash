'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import SignInDialog from '@/components/ui/SignInDialog';

export default function PortfolioPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return (
      <SignInDialog
        title="Access Your Portfolio"
        message="Sign in to view and manage your token portfolio"
        onClose={() => router.push('/')}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] bg-clip-text text-transparent">
          Your Portfolio
        </h1>
        {/* Portfolio content will go here */}
      </div>
    </div>
  );
} 