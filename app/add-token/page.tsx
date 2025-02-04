'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import AddTokenForm from '@/components/tokens/AddTokenForm';
import SignInDialog from '@/components/ui/SignInDialog';

export default function AddTokenPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return (
      <SignInDialog
        title="Sign In to Add Tokens"
        message="Please sign in to start adding and tracking your tokens"
        onClose={() => router.push('/')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0F1F] pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF]">
            Add New Token
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track and monitor any token by adding it to your dashboard
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-[#03E1FF]/10 p-6 md:p-8 backdrop-blur-xl">
          <div className="max-w-2xl mx-auto">
            <AddTokenForm />
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-6 border border-gray-200 dark:border-[#03E1FF]/10">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Adding a Token
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• Enter the token's contract address</li>
              <li>• Verify token details are correct</li>
              <li>• Add any relevant tags or notes</li>
              <li>• Submit to start tracking</li>
            </ul>
          </div>
          <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-6 border border-gray-200 dark:border-[#03E1FF]/10">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Token Requirements
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• Valid contract address</li>
              <li>• Verified smart contract</li>
              <li>• Active trading volume</li>
              <li>• Public token information</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 