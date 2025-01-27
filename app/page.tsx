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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Search Bar */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm dark:text-white"
                  placeholder="Search tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Menu Button */}
            <div className="ml-4 relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Your Tokens
                    </Link>
                    <Link
                      href="/saved"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Saved Tokens
                    </Link>
                    <Link
                      href="/shill-vision"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Shill Vision
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trending Coins Bar */}
      {trendingTokens.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow-sm mb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Trending</h2>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {trendingTokens.map((token) => (
                <div
                  key={token.contractAddress}
                  className="flex-shrink-0 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => router.push(`/tokens/${token.contractAddress}`)}
                >
                  <div className="flex items-center space-x-2">
                    <Image
                      src={token.logo}
                      alt={token.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{token.symbol}</p>
                      <p className={`text-sm ${
                        token.metadata.price_change_24h >= 0
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}>
                        {token.metadata.price_change_24h >= 0 ? '↑' : '↓'}
                        {Math.abs(token.metadata.price_change_24h).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
            className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500"
          >
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Token</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track a new token</p>
          </Link>

          {/* Token Cards */}
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredTokens.length > 0 ? (
            filteredTokens.map((token) => (
              <TokenCard key={token.contractAddress} token={token} />
            ))
          ) : searchQuery ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No tokens found matching "{searchQuery}"</p>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
