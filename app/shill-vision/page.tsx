'use client';

import { useEffect, useState } from 'react';
import { Rocket, Trophy, Clock, TrendingUp } from 'lucide-react';
import TokenCard from '@/components/tokens/TokenCard';

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

interface ShillVisionData {
  recentTokens: Token[];
  aboutToGraduate: Token[];
  graduated: Token[];
}

export default function ShillVisionPage() {
  const [data, setData] = useState<ShillVisionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/shill-vision');
        if (!response.ok) throw new Error('Failed to fetch data');
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0A0F1F] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-[#03E1FF] border-t-transparent animate-spin" />
              <div className="absolute inset-0 bg-[#03E1FF] rounded-full animate-pulse opacity-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0A0F1F] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-red-500 dark:text-red-400">
              {error || 'Failed to load data'}
            </h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0F1F] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] opacity-30 blur-xl rounded-full group-hover:opacity-50 transition-opacity duration-300" />
              <Rocket className="w-16 h-16 text-[#03E1FF] relative z-10 transform transition-transform duration-300 group-hover:scale-110" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] bg-clip-text text-transparent mb-4">
            Shill Vision
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Track tokens from their early stages to graduation with our advanced analytics
          </p>
        </div>

        {/* Recent Tokens */}
        <div className="mb-12 transform hover:translate-y-[-2px] transition-transform duration-300">
          <div className="flex items-center gap-3 mb-6 bg-gradient-to-r from-[#00FFA3]/10 via-[#03E1FF]/10 to-[#DC1FFF]/10 p-4 rounded-xl border border-[#03E1FF]/20">
            <Clock className="w-6 h-6 text-[#03E1FF]" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recently Added
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.recentTokens.map((token) => (
              <div key={token.contractAddress} className="transform transition-all duration-300 hover:scale-[1.02]">
                <TokenCard token={token} />
              </div>
            ))}
          </div>
        </div>

        {/* About to Graduate */}
        <div className="mb-12 transform hover:translate-y-[-2px] transition-transform duration-300">
          <div className="flex items-center gap-3 mb-6 bg-gradient-to-r from-[#00FFA3]/10 via-[#03E1FF]/10 to-[#DC1FFF]/10 p-4 rounded-xl border border-[#03E1FF]/20">
            <TrendingUp className="w-6 h-6 text-[#03E1FF]" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              About to Graduate
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                (10M - 100M MCap)
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.aboutToGraduate.map((token) => (
              <div key={token.contractAddress} className="transform transition-all duration-300 hover:scale-[1.02]">
                <TokenCard token={token} />
              </div>
            ))}
          </div>
        </div>

        {/* Graduated */}
        <div className="transform hover:translate-y-[-2px] transition-transform duration-300">
          <div className="flex items-center gap-3 mb-6 bg-gradient-to-r from-[#00FFA3]/10 via-[#03E1FF]/10 to-[#DC1FFF]/10 p-4 rounded-xl border border-[#03E1FF]/20">
            <Trophy className="w-6 h-6 text-[#03E1FF]" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Graduated
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({'>'}100M MCap)
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.graduated.map((token) => (
              <div key={token.contractAddress} className="transform transition-all duration-300 hover:scale-[1.02]">
                <TokenCard token={token} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 