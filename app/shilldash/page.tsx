'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, TrendingUp, Award, Sparkles } from 'lucide-react';
import TokenCard from '@/components/TokenCard';

interface Token {
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
  chartData?: {
    labels: string[];
    prices: number[];
  };
  onChainData?: {
    supply: string;
    decimals: number;
    mintAuthority?: string | null;
    freezeAuthority?: string | null;
    isInitialized?: boolean;
  };
  urls?: {
    explorers?: {
      solscan?: string;
      solanaFM?: string;
      explorer?: string;
    };
    trading?: {
      raydium?: string;
      jupiter?: string;
      orca?: string;
    };
  };
  description?: string;
  clerkUserId?: string;
  lastUpdated?: Date;
}

interface ShillVisionData {
  recentTokens: Token[];
  aboutToGraduate: Token[];
  graduated: Token[];
}

export default function ShillDashPage() {
  const [data, setData] = useState<ShillVisionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/shill-vision');
        if (!response.ok) throw new Error('Failed to fetch data');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const sections = [
    {
      id: 'recent',
      title: 'Recently Added',
      description: 'The latest gems added to our radar',
      icon: Sparkles,
      data: data?.recentTokens,
      gradient: 'from-[#03E1FF] to-[#00FFA3]',
    },
    {
      id: 'graduating',
      title: 'About to Graduate',
      description: 'Tokens approaching major milestones',
      icon: TrendingUp,
      data: data?.aboutToGraduate,
      gradient: 'from-[#00FFA3] to-[#DC1FFF]',
    },
    {
      id: 'graduated',
      title: 'Graduated',
      description: 'Tokens that reached their full potential',
      icon: Award,
      data: data?.graduated,
      gradient: 'from-[#DC1FFF] to-[#03E1FF]',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0A0F1F] pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#03E1FF] border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading ShillDash...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0A0F1F] pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/20">
              <Rocket className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-red-600 dark:text-red-400">{error}</h3>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#03E1FF] to-[#00FFA3] rounded-lg hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0F1F] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#03E1FF] via-[#00FFA3] to-[#DC1FFF] text-transparent bg-clip-text">
            ShillDash
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Your comprehensive view of the most promising tokens
          </p>
        </motion.div>

        {/* Sections */}
        <div className="grid grid-cols-1 gap-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="relative">
                  {/* Section Header */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${section.gradient}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {section.title}
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400">{section.description}</p>
                    </div>
                  </div>

                  {/* Token Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.data?.map((token) => (
                      <motion.div
                        key={token.contractAddress}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <TokenCard token={token} showReactions={false} show24hChange={false} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 