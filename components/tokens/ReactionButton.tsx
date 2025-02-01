import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

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

const colors = {
  rocket: '#00FFA3',
  poop: '#8B4513',
  like: '#FF3B30',
};

const SignInAlert = ({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) => {
  const router = useRouter();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
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
            className="relative bg-white dark:bg-[#0A0F1F] rounded-xl p-6 shadow-xl border border-[#03E1FF]/20 max-w-md w-full"
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <div className="flex space-x-2">
                  <span className="text-2xl">🚀</span>
                  <span className="text-2xl">❤️</span>
                  <span className="text-2xl">💩</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Sign in to React
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Join our community to share your reactions and engage with other traders!
              </p>
              <div className="flex flex-col space-y-2 pt-4">
                <button
                  onClick={() => router.push('/sign-in')}
                  className="w-full px-4 py-2 bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
                >
                  Sign In
                </button>
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-white/5 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
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
            className={`text-lg ${isSelected ? 'grayscale-0' : 'grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all duration-200'}`}
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