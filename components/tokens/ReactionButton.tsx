import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Poo, ThumbsUp } from 'lucide-react';

interface ReactionButtonProps {
  tokenAddress: string;
  type: 'rocket' | 'poop' | 'like';
  count: number;
  userReaction: string | null;
  onReact: (type: string) => Promise<void>;
}

const icons = {
  rocket: Rocket,
  poop: Poo,
  like: ThumbsUp,
};

const colors = {
  rocket: '#00FFA3',
  poop: '#8B4513',
  like: '#03E1FF',
};

export default function ReactionButton({ 
  tokenAddress, 
  type, 
  count, 
  userReaction, 
  onReact 
}: ReactionButtonProps) {
  const { isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [localCount, setLocalCount] = useState(count);
  const Icon = icons[type];
  const isSelected = userReaction === type;

  useEffect(() => {
    setLocalCount(count);
  }, [count]);

  const handleClick = async () => {
    if (!isSignedIn) {
      // You might want to show a sign-in prompt here
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      await onReact(type);
      // Count will be updated via the parent component
    } catch (error) {
      console.error('Error reacting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={isLoading}
      className={`relative flex items-center space-x-1 px-3 py-1.5 rounded-full transition-all ${
        isSelected
          ? 'bg-white/10 border border-[${colors[type]}]/50'
          : 'bg-white/5 hover:bg-white/10 border border-transparent'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`icon-${isSelected}`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Icon
            className={`w-4 h-4 ${
              isSelected ? `text-[${colors[type]}]` : 'text-gray-400'
            }`}
          />
        </motion.div>
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        <motion.span
          key={`count-${localCount}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className={`text-sm ${
            isSelected ? `text-[${colors[type]}]` : 'text-gray-400'
          }`}
        >
          {localCount}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
} 