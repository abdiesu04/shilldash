'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, SignInButton } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import AddTokenForm from '@/components/tokens/AddTokenForm';

export default function AddTokenPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      setShowSignInPrompt(true);
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return (
      <div className="fixed inset-0 bg-[#0A0F1F]/80 backdrop-blur-xl flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#0A0F1F] border border-[#03E1FF]/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-[0_0_30px_-15px_rgba(0,255,163,0.3)]"
        >
          <div className="text-center space-y-6">
            <div className="relative mx-auto w-16 h-16 mb-8">
              <div className="absolute inset-0 bg-[#03E1FF] rounded-full animate-ping opacity-20" />
              <div className="relative bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] p-4 rounded-full">
                <LogIn className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] bg-clip-text text-transparent">
              Sign In Required
            </h2>
            
            <p className="text-gray-400">
              Please sign in to add and track your tokens
            </p>

            <div className="flex flex-col gap-4 mt-8">
              <SignInButton mode="modal">
                <button className="w-full group relative flex items-center justify-center px-4 py-3 text-sm font-medium text-white overflow-hidden rounded-lg transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] opacity-100 group-hover:opacity-90 transition-opacity duration-300" />
                  <div className="absolute inset-[1px] bg-[#0A0F1F] rounded-lg group-hover:bg-transparent transition-all duration-300" />
                  <LogIn className="w-4 h-4 mr-2 relative z-10" />
                  <span className="relative z-10">Sign In Now</span>
                </button>
              </SignInButton>

              <button
                onClick={() => router.push('/')}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                Return to Home
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] bg-clip-text text-transparent">
          Add New Token
        </h1>
        <AddTokenForm onSuccess={() => router.push('/dashboard')} />
      </div>
    </div>
  );
} 