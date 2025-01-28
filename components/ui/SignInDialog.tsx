'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Sparkles, X } from 'lucide-react';
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
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node) && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-[#0A0F1F]/80 backdrop-blur-xl flex items-center justify-center z-50 p-4"
      >
        <motion.div
          ref={dialogRef}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative bg-[#0A0F1F] border border-[#03E1FF]/20 rounded-2xl p-8 max-w-md w-full shadow-[0_0_30px_-15px_rgba(0,255,163,0.3)]"
        >
          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors duration-300 rounded-lg hover:bg-white/5 group"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#00FFA3]/5 via-[#03E1FF]/5 to-[#DC1FFF]/5 rounded-2xl" />
          <div className="absolute inset-0 bg-[#0A0F1F]/60 backdrop-blur-sm rounded-2xl" />
          
          {/* Content */}
          <div className="relative text-center space-y-6">
            <motion.div 
              className="relative mx-auto w-20 h-20 mb-8"
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="absolute inset-0 bg-[#03E1FF] rounded-full animate-ping opacity-20" />
              <motion.div 
                className="relative bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] p-5 rounded-full"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <LogIn className="w-10 h-10 text-white" />
              </motion.div>
            </motion.div>
            
            <motion.h2 
              className="text-2xl font-bold bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] bg-clip-text text-transparent"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {title}
            </motion.h2>
            
            <motion.p 
              className="text-gray-400"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {message}
            </motion.p>

            <motion.div 
              className="flex flex-col gap-4 mt-8"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <SignInButton mode="modal">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full group relative flex items-center justify-center px-4 py-3 text-sm font-medium text-white overflow-hidden rounded-lg transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] opacity-100 group-hover:opacity-90 transition-opacity duration-300" />
                  <div className="absolute inset-[1px] bg-[#0A0F1F] rounded-lg group-hover:bg-transparent transition-all duration-300" />
                  <LogIn className="w-4 h-4 mr-2 relative z-10" />
                  <span className="relative z-10">Sign In Now</span>
                </motion.button>
              </SignInButton>

              {showHome && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center justify-center gap-2 py-2"
                >
                  Return to Home
                </motion.button>
              )}
            </motion.div>
          </div>

          {/* Decorative Elements */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 360]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-4 right-12 text-[#03E1FF]"
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, -360]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "linear",
              delay: 1.5
            }}
            className="absolute bottom-4 left-4 text-[#00FFA3]"
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 