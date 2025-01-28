'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, User, Bookmark, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TokenMenuProps {
  onOptionSelect: (option: string) => void;
}

export default function TokenMenu({ onOptionSelect }: TokenMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const menuOptions = [
    { id: 'your-tokens', label: 'Your Tokens', icon: User },
    { id: 'saved-tokens', label: 'Saved Tokens', icon: Bookmark },
    { id: 'shill-vision', label: 'Shill Vision', icon: Sparkles },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (optionId: string) => {
    onOptionSelect(optionId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative p-2 rounded-lg transition-all duration-300"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#00FFA3]/0 via-[#03E1FF]/0 to-[#DC1FFF]/0 group-hover:from-[#00FFA3]/10 group-hover:via-[#03E1FF]/10 group-hover:to-[#DC1FFF]/10 rounded-lg transition-all duration-300" />
        <div className="flex space-x-1">
          <div className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-[#03E1FF] transition-all duration-300" />
          <div className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-[#03E1FF] transition-all duration-300" />
          <div className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-[#03E1FF] transition-all duration-300" />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0A0F1F]/95 backdrop-blur-xl border border-[#03E1FF]/20 shadow-[0_0_30px_-15px_rgba(0,255,163,0.3)] overflow-hidden z-50"
          >
            <div className="py-2">
              {menuOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <motion.button
                    key={option.id}
                    whileHover={{ x: 5 }}
                    onClick={() => handleOptionClick(option.id)}
                    className="w-full px-4 py-2 text-left flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-300 group"
                  >
                    <Icon className="w-4 h-4 text-gray-400 group-hover:text-[#03E1FF] transition-colors duration-300" />
                    <span>{option.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 