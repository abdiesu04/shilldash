'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import Modal from '../ui/Modal';
import TokenDetails from './TokenDetails';

interface Token {
  id: string;
  contractAddress: string;
  name: string;
  symbol: string;
  logo: string;
  price: number;
  metadata: {
    market_cap: number;
    volume_24h: {
      m5: string;
      h1: string;
      h6: string;
      h24: string;
    };
    price_change_24h: {
      m5: string;
      h1: string;
      h6: string;
      h24: string;
    };
    liquidity: number;
  };
  onChainData: {
    supply: string;
    decimals: number;
    mintAuthority: string | null;
    freezeAuthority: string | null;
    isInitialized: boolean;
  };
  urls: {
    explorers: {
      solscan: string;
      solanaFM: string;
      explorer: string;
    };
    trading: {
      raydium: string;
      jupiter: string;
      orca: string;
    };
  };
  description?: string;
  clerkUserId?: string;
  lastUpdated?: Date;
}

export default function TrendingTokens() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('24h');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  useEffect(() => {
    fetchTrendingTokens();
  }, [timeframe]);

  const fetchTrendingTokens = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tokens/trending?timeframe=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch trending tokens');
      const data = await response.json();
      setTokens(data.tokens);
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenClick = (token: Token) => {
    setSelectedToken(token);
  };

  return (
    <div className="bg-white/5 rounded-xl border border-[#03E1FF]/20">
      {/* Header Section */}
      <div className="p-3 sm:p-4 border-b border-[#03E1FF]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-[#03E1FF]/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#03E1FF]" />
            </div>
            <h2 className="text-sm sm:text-base font-semibold text-white">Trending Tokens</h2>
          </div>
          <button
            onClick={() => setTimeframe(timeframe === '24h' ? '7d' : '24h')}
            className="px-2 py-1 text-xs font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300"
          >
            {timeframe === '24h' ? '24H' : '7D'}
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/5 to-transparent z-10 pointer-events-none" />
        <div className="overflow-x-auto lg:overflow-y-auto lg:h-[calc(100vh-16rem)] scrollbar-thin scrollbar-thumb-[#03E1FF]/20 hover:scrollbar-thumb-[#03E1FF]/30">
          <div className="p-3 sm:p-4 space-y-2 min-w-[300px] lg:min-w-0">
            {isLoading ? (
              // Loading skeletons with unique keys
              [...Array(5)].map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="flex items-center space-x-3 p-2 sm:p-3 bg-white/5 rounded-lg animate-pulse"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/10 rounded w-24" />
                    <div className="h-3 bg-white/10 rounded w-16" />
                  </div>
                  <div className="w-16 h-8 bg-white/10 rounded-lg" />
                </div>
              ))
            ) : (
              tokens.map((token) => (
                <button
                  key={`${token.id}-${token.contractAddress}`}
                  onClick={() => handleTokenClick(token)}
                  className="w-full flex items-center space-x-3 p-2 sm:p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300"
                >
                  <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 overflow-hidden">
                    <Image
                      src={token.logo}
                      alt={token.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm sm:text-base font-medium text-white truncate">
                        {token.name}
                      </p>
                      <span className="text-xs text-gray-400">
                        {token.symbol}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400">
                      ${token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${
                    Number(token.metadata.price_change_24h.h24) >= 0
                      ? 'text-green-400 bg-green-400/10'
                      : 'text-red-400 bg-red-400/10'
                  }`}>
                    {Number(token.metadata.price_change_24h.h24) >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span className="text-xs font-medium">
                      {Math.abs(Number(token.metadata.price_change_24h.h24)).toFixed(2)}%
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Token Details Modal */}
      <Modal
        isOpen={!!selectedToken}
        onClose={() => setSelectedToken(null)}
        title={selectedToken ? `${selectedToken.name} (${selectedToken.symbol})` : ''}
        size="lg"
      >
        {selectedToken && <TokenDetails token={selectedToken} />}
      </Modal>
    </div>
  );
} 