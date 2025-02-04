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
    <div className="flex flex-col items-center w-full p-2 bg-white/5 rounded-lg">
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Reactions</div>
      <div className="flex items-center gap-3">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleReaction('rocket');
          }}
          disabled={isLoading}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200
            bg-white dark:bg-gray-700/50 border border-[#03E1FF]/20 
            hover:border-[#03E1FF] hover:scale-105
            active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            ${userReaction === 'rocket' ? 'text-[#03E1FF] border-[#03E1FF]/40' : 'text-gray-700 dark:text-gray-300'}
          `}
        >
          <span className="text-xl">🚀</span>
          <span className="text-sm font-medium">{reactionCounts.rocket}</span>
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleReaction('poop');
          }}
          disabled={isLoading}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200
            bg-white dark:bg-gray-700/50 border border-[#DC1FFF]/20
            hover:border-[#DC1FFF] hover:scale-105
            active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            ${userReaction === 'poop' ? 'text-[#DC1FFF] border-[#DC1FFF]/40' : 'text-gray-700 dark:text-gray-300'}
          `}
        >
          <span className="text-xl">💩</span>
          <span className="text-sm font-medium">{reactionCounts.poop}</span>
        </button>
      </div>

      {error && (
        <span className="text-xs text-red-500 animate-pulse mt-2">{error}</span>
      )}
    </div>
  );
} 