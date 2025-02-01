import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';

interface ReactionButtonProps {
  tokenAddress: string;
  type: 'rocket' | 'poop' | 'like';
  count: number;
  userReaction: string | null;
  onReact: (type: string) => Promise<void>;
}

const emojis = {
  rocket: '🚀',
  poop: '💩',
  like: '❤️',
};

const SignInAlert = ({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 px-4"
          onClick={onClose}
        >
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative bg-[#0A0F1F] rounded-lg p-4 shadow-lg border border-[#03E1FF]/20 max-w-sm"
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1">
                <span>🚀</span>
                <span>❤️</span>
                <span>💩</span>
              </div>
              <p className="text-sm text-gray-300">
                Please sign in using the navigation bar to react
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function ReactionButton({ 
  type, 
  count, 
  userReaction, 
  onReact 
}: ReactionButtonProps) {
  const { isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [localCount, setLocalCount] = useState(count);
  const [showSignInAlert, setShowSignInAlert] = useState(false);
  const emoji = emojis[type];
  const isSelected = userReaction === type;

  const handleClick = async () => {
    if (!isSignedIn) {
      setShowSignInAlert(true);
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      
      // Optimistically update the UI
      const newCount = isSelected ? localCount - 1 : localCount + 1;
      setLocalCount(newCount);
      
      // Call parent's onReact
      await onReact(type);
      
      // Don't reset the count here, let the parent component handle it
      // through the count prop update
    } catch (error) {
      console.error('Error in reaction process:', error);
      // Revert optimistic update on error
      setLocalCount(count);
    } finally {
      setIsLoading(false);
    }
  };

  // Update local count when prop changes
  useEffect(() => {
    console.log('Count prop updated:', { type, count, localCount });
    setLocalCount(count);
  }, [count]);

  return (
    <>
      <motion.button
        onClick={handleClick}
        disabled={isLoading}
        className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${
          isSelected
            ? 'bg-white/10 border border-white/20'
            : 'bg-white/5 hover:bg-white/10 border border-transparent'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`emoji-${isSelected}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`text-lg ${isSelected ? 'opacity-100' : 'opacity-70 hover:opacity-100 transition-all duration-200'}`}
          >
            {emoji}
          </motion.div>
        </AnimatePresence>
        
        <AnimatePresence mode="wait">
          <motion.span
            key={`count-${localCount}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`text-sm font-medium ${
              isSelected ? 'text-white' : 'text-gray-400'
            }`}
          >
            {localCount}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <SignInAlert 
        isVisible={showSignInAlert} 
        onClose={() => setShowSignInAlert(false)} 
      />
    </>
  );
} 