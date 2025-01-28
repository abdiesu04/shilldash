'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import TokenCard from '@/components/tokens/TokenCard';
import { Search, Menu, Plus, TrendingUp } from 'lucide-react';

interface Token {
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

export default function Home() {
  const router = useRouter();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [trendingTokens, setTrendingTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await fetch('/api/tokens/list');
        const data = await response.json();
        setTokens(data.tokens || []);
      } catch (error) {
        console.error('Error fetching tokens:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTrendingTokens = async () => {
      try {
        const response = await fetch('/api/tokens/trending');
        const data = await response.json();
        setTrendingTokens(data.tokens || []);
      } catch (error) {
        console.error('Error fetching trending tokens:', error);
      }
    };

    fetchTokens();
    fetchTrendingTokens();
  }, []);

  const filteredTokens = tokens.filter(token => 
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0C0F1F]">
      {/* Search Bar */}
      <div className="sticky top-16 z-10 bg-[#0C0F1F]/80 backdrop-blur-xl border-b border-[#03E1FF]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#03E1FF]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-[#03E1FF]/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#03E1FF]/50 focus:border-transparent transition-all duration-300"
              placeholder="Search tokens..."
            />
          </div>
        </div>
      </div>

      {/* Trending Coins Bar */}
      {trendingTokens.length > 0 && (
        <div className="bg-gradient-to-r from-[#0C0F1F] via-[#151933] to-[#0C0F1F] border-b border-[#03E1FF]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="h-5 w-5 text-[#00FFA3]" />
              <h2 className="text-lg font-semibold bg-gradient-to-r from-[#00FFA3] to-[#03E1FF] bg-clip-text text-transparent">
                Trending
              </h2>
            </div>
            <div className="relative">
              <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
                {trendingTokens.map((token) => (
                  <div
                    key={token.contractAddress}
                    className="flex-shrink-0 w-[280px] bg-white/5 backdrop-blur-xl rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-all duration-300 border border-[#03E1FF]/20 hover:border-[#03E1FF]/40 transform hover:scale-[1.02]"
                    onClick={() => router.push(`/tokens/${token.contractAddress}`)}
                  >
                    <div className="flex items-center space-x-3">
                      <Image
                        src={token.logo}
                        alt={token.name}
                        width={40}
                        height={40}
                        className="rounded-full ring-2 ring-[#03E1FF]/20"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-white">{token.symbol}</p>
                          <span className={`text-sm px-2 py-0.5 rounded-full ${
                            token.metadata.price_change_24h >= 0
                              ? 'bg-[#00FFA3]/10 text-[#00FFA3]'
                              : 'bg-red-500/10 text-red-500'
                          }`}>
                            {token.metadata.price_change_24h >= 0 ? '↑' : '↓'}
                            {Math.abs(token.metadata.price_change_24h).toFixed(2)}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">${token.price.toFixed(4)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-[#0C0F1F] pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add Token Card */}
          <Link
            href="/add-token"
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#0C0F1F] to-[#151933] rounded-xl border border-[#03E1FF]/20 hover:border-[#03E1FF]/40 transition-all duration-300 transform hover:scale-[1.02] group"
          >
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] p-[2px] mb-4">
              <div className="h-full w-full rounded-full bg-[#0C0F1F] flex items-center justify-center group-hover:bg-transparent transition-all duration-300">
                <Plus className="h-6 w-6 text-[#03E1FF] group-hover:text-white" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-white group-hover:text-[#03E1FF] transition-colors duration-300">
              Add Token
            </h3>
            <p className="mt-1 text-sm text-gray-400">Track a new token</p>
          </Link>

          {/* Token Cards */}
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#03E1FF] border-t-transparent"></div>
            </div>
          ) : filteredTokens.length > 0 ? (
            filteredTokens.map((token) => (
              <TokenCard key={token.contractAddress} token={token} />
            ))
          ) : searchQuery ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">No tokens found matching "{searchQuery}"</p>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
