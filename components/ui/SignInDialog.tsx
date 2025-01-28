'use client';

import { motion } from 'framer-motion';
import { LogIn, Sparkles } from 'lucide-react';
import { SignInButton } from '@clerk/nextjs';

interface SignInDialogProps {
  title?: string;
  message?: string;
  showHome?: boolean;
  onClose?: () => void;
}

export default function SignInDialog({
  title = "Sign In Required",
  message = "Please sign in to access this feature",
  showHome = true,
  onClose
}: SignInDialogProps) {
  return (
    <div className="fixed inset-0 bg-[#0A0F1F]/90 backdrop-blur-xl flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-[#0A0F1F] border border-[#03E1FF]/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-[0_0_30px_-15px_rgba(0,255,163,0.3)]"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00FFA3]/5 via-[#03E1FF]/5 to-[#DC1FFF]/5 rounded-2xl" />
        <div className="absolute inset-0 bg-[#0A0F1F]/60 backdrop-blur-sm rounded-2xl" />
        
        {/* Content */}
        <div className="relative text-center space-y-6">
          <div className="relative mx-auto w-20 h-20 mb-8">
            <div className="absolute inset-0 bg-[#03E1FF] rounded-full animate-ping opacity-20" />
            <div className="relative bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] p-5 rounded-full">
              <LogIn className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] bg-clip-text text-transparent">
            {title}
          </h2>
          
          <p className="text-gray-400">
            {message}
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

            {showHome && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center justify-center gap-2"
              >
                Return to Home
              </button>
            )}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 text-[#03E1FF] animate-pulse">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="absolute bottom-4 left-4 text-[#00FFA3] animate-pulse delay-300">
          <Sparkles className="w-4 h-4" />
        </div>
      </motion.div>
    </div>
  );
} 