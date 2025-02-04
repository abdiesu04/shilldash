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
    volume_24h: number;
    price_change_24h: number;
  };
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
    // No-op
  };

  return (
    <div className="bg-white dark:bg-gradient-to-br dark:from-[#0A0F1F] dark:to-[#151933] rounded-xl border border-gray-200 dark:border-[#03E1FF]/20">
      {/* Header Section */}
      <div className="p-4 border-b border-gray-200 dark:border-[#03E1FF]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#03E1FF]" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Trending Tokens</h2>
          </div>
          <button
            onClick={() => setTimeframe(timeframe === '24h' ? '7d' : '24h')}
            className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-all duration-300"
          >
            {timeframe === '24h' ? '24H' : '7D'}
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white dark:from-[#0A0F1F] to-transparent z-10 pointer-events-none" />
        <div className="h-[calc(100vh-16rem)] overflow-y-auto scrollbar-thin scrollbar-track-transparent dark:scrollbar-track-[#151933] scrollbar-thumb-gray-200 dark:scrollbar-thumb-[#03E1FF]/20 hover:scrollbar-thumb-gray-300 dark:hover:scrollbar-thumb-[#03E1FF]/30">
          <div className="p-4 space-y-3">
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div 
                    key={`skeleton-${i}`} 
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gray-200 dark:bg-white/10 rounded-full" />
                      <div className="w-28 h-4 bg-gray-200 dark:bg-white/10 rounded" />
                    </div>
                    <div className="w-20 h-4 bg-gray-200 dark:bg-white/10 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              tokens.map((token, index) => (
                <div
                  key={token.contractAddress}
                  className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-300 cursor-pointer"
                  onClick={() => handleTokenClick(token)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-[#03E1FF]">
                      {index + 1}
                    </div>
                    <div className="relative">
                      <Image
                        src={token.logo}
                        alt={`${token.name} logo`}
                        width={28}
                        height={28}
                        className="rounded-full ring-2 ring-gray-200 dark:ring-[#03E1FF]/20 group-hover:ring-[#03E1FF]/40 transition-all duration-300"
                      />
                      {token.metadata.price_change_24h > 5 && (
                        <div className="absolute -top-1 -right-1">
                          <Sparkles className="w-2.5 h-2.5 text-[#00FFA3] animate-pulse" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#03E1FF] transition-colors duration-300">
                        {token.name}
                      </h3>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        {token.symbol}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-900 dark:text-white group-hover:text-[#03E1FF] transition-colors duration-300">
                      ${token.price < 0.01 ? token.price.toFixed(8) : token.price.toFixed(2)}
                    </p>
                    <div className={`flex items-center justify-end space-x-1 text-[10px] ${
                      token.metadata.price_change_24h >= 0
                        ? 'text-green-500 dark:text-[#00FFA3]'
                        : 'text-red-500'
                    }`}>
                      {token.metadata.price_change_24h >= 0 ? (
                        <TrendingUp className="w-2.5 h-2.5" />
                      ) : (
                        <TrendingDown className="w-2.5 h-2.5" />
                      )}
                      <span>{Math.abs(token.metadata.price_change_24h).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white dark:from-[#0A0F1F] to-transparent z-10 pointer-events-none" />
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