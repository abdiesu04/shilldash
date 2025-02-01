'use client';

import Image from 'next/image';
import { TrendingUp, TrendingDown, Star, StarOff } from 'lucide-react';
import { useState } from 'react';

interface TokenDetailsProps {
  token: {
    name: string;
    symbol: string;
    logo: string;
    price: number;
    metadata: {
      market_cap: number;
      volume_24h: number;
      price_change_24h: number;
    };
    contractAddress: string;
  };
  onSaveToggle?: (newSavedState: boolean) => Promise<void>;
}

const formatNumber = (num: number) => {
  if (num >= 1e9) {
    return `$${(num / 1e9).toFixed(2)}B`;
  }
  if (num >= 1e6) {
    return `$${(num / 1e6).toFixed(2)}M`;
  }
  return `$${num.toFixed(2)}`;
};

export default function TokenDetails({ token, onSaveToggle }: TokenDetailsProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSaveToggle = async () => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      const newSavedState = !isSaved;
      
      const response = await fetch('/api/user/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenAddress: token.contractAddress,
          action: 'save',
          remove: isSaved
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update saved status');
      }

      setIsSaved(newSavedState);
      if (onSaveToggle) {
        await onSaveToggle(newSavedState);
      }
    } catch (error) {
      console.error('Error saving token:', error);
      alert(error instanceof Error ? error.message : 'Failed to save token');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {token.logo && (
            <div className="relative">
              <Image
                src={token.logo}
                alt={`${token.name} logo`}
                width={64}
                height={64}
                className="rounded-full ring-2 ring-[#03E1FF]/20"
              />
            </div>
          )}
          <div>
            <h3 className="text-2xl font-bold text-white">
              ${token.price.toFixed(6)}
            </h3>
            <div className={`flex items-center space-x-2 ${
              token.metadata.price_change_24h >= 0
                ? 'text-[#00FFA3]'
                : 'text-red-500'
            }`}>
              {token.metadata.price_change_24h >= 0 ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
              <span className="text-lg font-semibold">
                {Math.abs(token.metadata.price_change_24h).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleSaveToggle}
          disabled={isUpdating}
          className={`p-2 rounded-lg transition-colors duration-300 ${
            isSaved 
              ? 'text-[#03E1FF] hover:text-[#03E1FF]/80' 
              : 'text-gray-400 hover:text-[#03E1FF]'
          }`}
        >
          {isSaved ? <Star className="w-6 h-6 fill-current" /> : <StarOff className="w-6 h-6" />}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white/5 border border-[#03E1FF]/10">
            <p className="text-sm text-gray-400 mb-1">
              Market Cap
            </p>
            <p className="text-xl font-semibold text-white">
              {formatNumber(token.metadata.market_cap)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-[#03E1FF]/10">
            <p className="text-sm text-gray-400 mb-1">
              24h Volume
            </p>
            <p className="text-xl font-semibold text-white">
              {formatNumber(token.metadata.volume_24h)}
            </p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-[#03E1FF]/10 h-full">
          <p className="text-sm text-gray-400 mb-2">
            Contract Address
          </p>
          <p className="font-mono text-sm text-white break-all">
            {token.contractAddress}
          </p>
        </div>
      </div>
    </div>
  );
} 