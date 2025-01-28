'use client';

import { Plus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyTokenGridProps {
  onAddClick: () => void;
}

export default function EmptyTokenGrid({ onAddClick }: EmptyTokenGridProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <motion.button
        onClick={onAddClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group relative w-64 h-64 bg-[#0A0F1F]/60 backdrop-blur-xl rounded-2xl border border-[#03E1FF]/20 overflow-hidden"
      >
        {/* Background animations */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00FFA3]/5 via-[#03E1FF]/5 to-[#DC1FFF]/5 opacity-0 group-hover:opacity-100 transition-all duration-700" />
        <div className="absolute -inset-px bg-gradient-to-r from-[#00FFA3]/20 via-[#03E1FF]/20 to-[#DC1FFF]/20 opacity-0 group-hover:opacity-100 transition-all duration-700" />
        
        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center p-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-[#03E1FF] rounded-full animate-ping opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
            <div className="relative bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] p-4 rounded-full">
              <Plus className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] bg-clip-text text-transparent">
              Add Your First Token
            </h3>
            <p className="text-sm text-gray-400">
              Time to mine some gems! ✨
            </p>
          </div>

          {/* Decorative sparkles */}
          <div className="absolute top-4 right-4 text-[#03E1FF] animate-pulse">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="absolute bottom-4 left-4 text-[#00FFA3] animate-pulse delay-300">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </motion.button>
    </div>
  );
} 