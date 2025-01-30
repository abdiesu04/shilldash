import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ReactionCounts {
  fire: number;
  poop: number;
  rocket: number;
}

interface TokenReactionsProps {
  tokenId: string;
  initialReactionCounts: ReactionCounts;
  onReactionUpdate?: (newCounts: ReactionCounts) => void;
}

const REACTIONS = [
  { type: 'fire', emoji: '🔥', label: 'Fire' },
  { type: 'poop', emoji: '💩', label: 'Poop' },
  { type: 'rocket', emoji: '🚀', label: 'Rocket' }
] as const;

export default function TokenReactions({
  tokenId,
  initialReactionCounts,
  onReactionUpdate
}: TokenReactionsProps) {
  const { isSignedIn } = useAuth();
  const [reactionCounts, setReactionCounts] = useState<ReactionCounts>(initialReactionCounts);
  const [isLoading, setIsLoading] = useState(false);

  // Poll for updates every 5 seconds
  useEffect(() => {
    if (!isSignedIn) return;

    const fetchReactions = async () => {
      try {
        const response = await fetch(`/api/tokens/${tokenId}/reactions`);
        if (!response.ok) return;

        const data = await response.json();
        if (data.reactionCounts) {
          setReactionCounts(data.reactionCounts);
          onReactionUpdate?.(data.reactionCounts);
        }
      } catch (error) {
        console.error('Error fetching reactions:', error);
      }
    };

    // Initial fetch
    fetchReactions();

    // Set up polling
    const interval = setInterval(fetchReactions, 5000);

    return () => clearInterval(interval);
  }, [tokenId, isSignedIn, onReactionUpdate]);

  const handleReaction = async (type: keyof ReactionCounts) => {
    if (!isSignedIn) {
      toast.error('Please sign in to react to tokens');
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/tokens/${tokenId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        throw new Error('Failed to update reaction');
      }

      const data = await response.json();
      setReactionCounts(data.reactionCounts);
      onReactionUpdate?.(data.reactionCounts);
    } catch (error) {
      console.error('Error updating reaction:', error);
      toast.error('Failed to update reaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute bottom-[4.5rem] left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1 z-20">
      {REACTIONS.map(({ type, emoji, label }) => (
        <motion.button
          key={type}
          onClick={() => handleReaction(type)}
          className="group relative flex items-center gap-1 hover:bg-black/60 rounded-full px-2 py-1 transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isLoading}
        >
          <span className="text-base leading-none">{emoji}</span>
          <span className="text-xs font-medium text-white/90 min-w-[1rem] text-center leading-none">
            {reactionCounts[type]}
          </span>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/75 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30">
            {label}
          </div>
        </motion.button>
      ))}
    </div>
  );
} 