'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

interface TokenReactionsProps {
  tokenAddress: string;
}

type ReactionType = 'rocket' | 'poop';

interface ReactionCounts {
  rocket: number;
  poop: number;
}

export default function TokenReactions({ tokenAddress }: TokenReactionsProps) {
  const { isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [reactionCounts, setReactionCounts] = useState<ReactionCounts>({ rocket: 0, poop: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('🔄 TokenReactions mounted for token:', tokenAddress);
    fetchReactions();
  }, [tokenAddress]);

  const fetchReactions = async () => {
    try {
      console.log('📡 Fetching reactions for token:', tokenAddress);
      const response = await fetch(`/api/tokens/${tokenAddress}/reaction`);
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) throw new Error('Failed to fetch reactions');
      
      const data = await response.json();
      console.log('📊 Reaction data received:', data);
      setReactionCounts(data.reactions);
      setUserReaction(data.userReaction);
      console.log('✅ State updated with reactions:', data.reactions);
    } catch (error) {
      console.error('❌ Error fetching reactions:', error);
      setError('Failed to load reactions');
    }
  };

  const handleReaction = async (type: 'rocket' | 'poop') => {
    if (!isSignedIn) {
      console.log('⚠️ User not signed in');
      setError('Please sign in to react');
      return;
    }

    setIsLoading(true);
    setError('');
    console.log('🎯 Handling reaction:', type);

    // Optimistic update
    const previousReaction = userReaction;
    const previousCounts = { ...reactionCounts };
    console.log('💾 Previous state:', { previousReaction, previousCounts });

    // Update UI immediately
    if (previousReaction === type) {
      // Removing reaction
      setUserReaction(null);
      setReactionCounts(prev => ({
        ...prev,
        [type]: Math.max(0, prev[type] - 1)
      }));
      console.log('🔄 Removing reaction');
    } else {
      // Adding/changing reaction
      if (previousReaction) {
        setReactionCounts(prev => ({
          ...prev,
          [previousReaction]: Math.max(0, prev[previousReaction] - 1),
          [type]: prev[type] + 1
        }));
        console.log('🔄 Changing reaction');
      } else {
        setReactionCounts(prev => ({
          ...prev,
          [type]: prev[type] + 1
        }));
        console.log('🔄 Adding new reaction');
      }
      setUserReaction(type);
    }

    try {
      console.log('📡 Sending reaction update to server');
      const response = await fetch(`/api/tokens/${tokenAddress}/reaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactionType: type }),
      });
      console.log('📥 Server response status:', response.status);

      if (!response.ok) throw new Error('Failed to update reaction');
      
      const data = await response.json();
      console.log('📊 Server response data:', data);
      setReactionCounts(data.reactions);
      console.log('✅ Reaction update successful');
    } catch (error) {
      console.error('❌ Error updating reaction:', error);
      // Revert optimistic update on error
      setUserReaction(previousReaction);
      setReactionCounts(previousCounts);
      setError('Failed to update reaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <button
        onClick={(e) => handleReaction('rocket')}
        className={`inline-flex items-center space-x-1 p-1 rounded-md transition-all duration-300 ${
          userReaction === 'rocket'
            ? 'bg-[#03E1FF]/10 text-[#03E1FF]'
            : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400'
        }`}
      >
        <span className="text-base">🚀</span>
        <span className="text-xs font-medium">{reactionCounts.rocket}</span>
      </button>
      <button
        onClick={(e) => handleReaction('poop')}
        className={`inline-flex items-center space-x-1 p-1 rounded-md transition-all duration-300 ${
          userReaction === 'poop'
            ? 'bg-[#03E1FF]/10 text-[#03E1FF]'
            : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400'
        }`}
      >
        <span className="text-base">💩</span>
        <span className="text-xs font-medium">{reactionCounts.poop}</span>
      </button>
    </div>
  );
} 