'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { TrendingUp, TrendingDown, Trash2, Crown, Star, StarOff } from 'lucide-react';
import Modal from '../ui/Modal';
import type { ChartData, ScriptableContext, TooltipItem } from 'chart.js';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import ReactionButton from './ReactionButton';

// Register Chart.js plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const timeframes = [
  { label: '1H', value: '1h' },
  { label: '24H', value: '24h' },
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
];

interface TokenCardProps {
  token: {
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
    chartData?: {
      labels: string[];
      prices: number[];
    };
    clerkUserId?: string;
    isSaved?: boolean;
  };
  onDelete?: (contractAddress: string) => void;
  showDeleteButton?: boolean;
}

interface ReactionCounts {
  rocket: number;
  poop: number;
  like: number;
}

const generateChartData = (basePrice: number, dataPoints: number = 24) => {
  const volatility = 0.02; // 2% volatility
  const trend = Math.random() > 0.5 ? 1 : -1; // Random trend direction
  const times = Array.from({ length: dataPoints }, (_, i) => i);
  const prices = times.reduce((acc: number[], _, i) => {
    const lastPrice = i === 0 ? basePrice : acc[i - 1];
    const change = lastPrice * volatility * (Math.random() - 0.5) + (trend * lastPrice * 0.001);
    return [...acc, lastPrice + change];
  }, []);

  return {
    labels: times.map(t => t.toString()),
    prices,
  };
};

export default function TokenCard({ token, onDelete, showDeleteButton }: TokenCardProps) {
  const { userId } = useAuth(); 
  const isMyToken = userId && token.clerkUserId === userId;
  const canDelete = showDeleteButton && userId && token.clerkUserId === userId;
  const router = useRouter();

  const [showDetails, setShowDetails] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [isSaved, setIsSaved] = useState(token.isSaved || false);
  const [isMobile, setIsMobile] = useState(false);
  const [reactionCounts, setReactionCounts] = useState<ReactionCounts>({
    rocket: 0,
    poop: 0,
    like: 0,
  });
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchReactions();
  }, [token.contractAddress, userId]);

  const fetchReactions = async () => {
    try {
      console.log('Fetching reactions for token:', token.contractAddress);
      const response = await fetch(
        `/api/reactions?tokenAddress=${token.contractAddress}${userId ? `&userId=${userId}` : ''}`
      );
      console.log('Fetch reactions response status:', response.status);
      const data = await response.json();
      console.log('Fetch reactions data:', data);
      setReactionCounts(data.counts);
      setUserReaction(data.userReaction);
    } catch (error) {
      console.error('Error fetching reactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = async (type: string) => {
    try {
      console.log('Handling reaction in TokenCard:', {
        type,
        tokenAddress: token.contractAddress,
        currentCounts: reactionCounts,
        userReaction
      });

      // Make the API call
      const response = await fetch('/api/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenAddress: token.contractAddress,
          type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update reaction');
      }

      const data = await response.json();
      console.log('Reaction response:', data);

      // Update the local state with the response data
      setReactionCounts(data.counts);
      setUserReaction(data.userReaction);

    } catch (error) {
      console.error('Error handling reaction:', error);
      // Fetch the current state again in case of error
      await fetchReactions();
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`;
    }
    if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    }
    return `$${num.toFixed(2)}`;
  };

  const prices = token.chartData?.prices || generateChartData(token.price).prices;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceMargin = (maxPrice - minPrice) * 0.05;

  // Define chart options with proper types
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: 'easeOutQuart',
    },
    interaction: {
      intersect: false,
      mode: 'nearest',
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(10, 15, 31, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: 'bold',
          family: 'Inter',
        },
        bodyFont: {
          size: 13,
          family: 'Inter',
        },
        callbacks: {
          label: function(context) {
            return `$${Number(context.parsed.y).toFixed(6)}`;
          },
          title: function(context) {
            const value = context[0].parsed.x;
            if (selectedTimeframe === '1h') {
              return `${value}m ago`;
            } else if (selectedTimeframe === '24h') {
              return `${value}h ago`;
            } else {
              return `${value}d ago`;
            }
          }
        },
      },
    },
    scales: {
      x: {
        type: 'linear',
        display: false,
        grid: {
          display: false,
        },
        ticks: {
          display: false,
          maxRotation: 0,
          padding: 8,
          callback: function(tickValue) {
            if (selectedTimeframe === '1h') {
              return `${tickValue}m`;
            } else if (selectedTimeframe === '24h') {
              return `${tickValue}h`;
            } else {
              return `${tickValue}d`;
            }
          },
        },
      },
      y: {
        type: 'linear',
        display: false,
        grid: {
          display: false,
        },
        ticks: {
          display: false,
          padding: 12,
          callback: function(tickValue) {
            return `$${Number(tickValue).toFixed(2)}`;
          },
        },
        suggestedMin: minPrice - priceMargin,
        suggestedMax: maxPrice + priceMargin,
      },
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 4,
        hitRadius: 4,
        hoverBackgroundColor: token.metadata.price_change_24h >= 0 
          ? 'rgb(16, 185, 129)'
          : 'rgb(239, 68, 68)',
        borderWidth: 2,
        borderColor: '#ffffff',
      },
      line: {
        tension: 0.4,
        borderWidth: 2,
        borderCapStyle: 'round',
        borderJoinStyle: 'round',
        cubicInterpolationMode: 'monotone',
      },
    },
  };

  // Enhanced detail chart options for modal
  const detailChartOptions = {
    ...chartOptions,
    animation: {
      duration: 750,
      easing: 'easeOutQuart' as const,
    },
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        enabled: true,
        titleFont: {
          ...chartOptions.plugins.tooltip.titleFont,
          size: 16,
        },
        bodyFont: {
          ...chartOptions.plugins.tooltip.bodyFont,
          size: 15,
        },
        padding: 16,
        backgroundColor: 'rgba(10, 15, 31, 0.98)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(3, 225, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        animation: {
          duration: 150,
        },
      },
    },
    scales: {
      x: {
        type: 'linear' as const,
        display: true,
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: '#94A3B8',
          font: {
            size: 12,
            family: 'Inter',
          },
          maxRotation: 0,
          padding: 8,
          callback: (value: any) => {
            if (selectedTimeframe === '1h') {
              return `${value}m`;
            } else if (selectedTimeframe === '24h') {
              return `${value}h`;
            } else {
              return `${value}d`;
            }
          },
        },
        border: {
          display: false,
        },
        min: 0,
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false,
          lineWidth: 1,
        },
        ticks: {
          color: '#94A3B8',
          font: {
            size: 12,
            family: 'Inter',
          },
          padding: 12,
          callback: (value: any) => `$${value.toFixed(2)}`,
        },
        border: {
          display: false,
        },
        suggestedMin: minPrice - priceMargin,
        suggestedMax: maxPrice + priceMargin,
      },
    },
  };

  const chartData: ChartData<'line'> = {
    labels: token.chartData?.labels || generateChartData(token.price).labels,
    datasets: [
      {
        data: token.chartData?.prices || generateChartData(token.price).prices,
        borderColor: token.metadata.price_change_24h >= 0 
          ? 'rgb(16, 185, 129)'
          : 'rgb(239, 68, 68)',
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          if (token.metadata.price_change_24h >= 0) {
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.05)');
            gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.02)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
          } else {
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.05)');
            gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.02)');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
          }
          return gradient;
        },
        fill: true,
        cubicInterpolationMode: 'monotone',
        tension: 0.4,
      },
    ],
  };

  const handleTimeframeChange = async (timeframe: string) => {
    setIsLoading(true);
    setSelectedTimeframe(timeframe);
    // Simulate loading state for demo
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent modal from opening
    if (!canDelete || !onDelete) return;

    try {
      const response = await fetch(`/api/tokens/${token.contractAddress}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDelete(token.contractAddress);
      }
    } catch (error) {
      console.error('Error deleting token:', error);
    }
  };

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent modal from opening
    
    if (!userId) {
      alert('Please sign in to save tokens');
      return;
    }
    
    try {
      const response = await fetch('/api/user/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include', // Important for Clerk authentication
        body: JSON.stringify({
          tokenAddress: token.contractAddress,
          action: 'save',
          remove: isSaved
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Only update the UI state if the server operation was successful
      setIsSaved(!isSaved);
      
      // Refresh the token list to reflect the changes
      router.refresh();
    } catch (error) {
      console.error('Error saving token:', {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        tokenAddress: token.contractAddress,
        userId
      });
      alert(error instanceof Error ? error.message : 'Failed to update saved status');
    }
  };

  return (
    <>
      <div
        className={`group relative bg-white dark:bg-gradient-to-br dark:from-[#0A0F1F] dark:to-[#151933] rounded-xl border border-gray-200 dark:border-[#03E1FF]/20 hover:border-[#03E1FF]/40 transition-all duration-500 ${
          isMobile ? 'p-3 min-w-[280px] snap-start' : 'p-4'
        }`}
      >
        {/* Decorative Edges */}
        <div className="absolute -top-px left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#03E1FF]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -left-px top-[10%] bottom-[10%] w-[1px] bg-gradient-to-b from-transparent via-[#03E1FF]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -right-px top-[10%] bottom-[10%] w-[1px] bg-gradient-to-b from-transparent via-[#03E1FF]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -bottom-px left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#03E1FF]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Main content section that triggers modal */}
        <div onClick={() => setShowDetails(true)}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Image
                  src={token.logo}
                  alt={`${token.name} logo`}
                  width={48}
                  height={48}
                  className="rounded-full ring-2 ring-gray-200 dark:ring-[#03E1FF]/20 group-hover:ring-[#03E1FF]/40 transition-all duration-300"
                />
                {token.metadata.price_change_24h > 5 && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-[#00FFA3]/10 flex items-center justify-center">
                      <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-[#00FFA3]" />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#03E1FF] transition-colors duration-300">
                    {token.name}
                  </h3>
                  {isMyToken && (
                    <div className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-[#00FFA3]/10 via-[#03E1FF]/10 to-[#DC1FFF]/10 backdrop-blur-sm border border-[#03E1FF]/20 shadow-[0_0_30px_-15px_rgba(0,255,163,0.3)] group/badge">
                      <div className="flex items-center space-x-1">
                        <Crown className="w-3 h-3 text-[#03E1FF]" />
                        <span className="text-[10px] font-medium text-[#03E1FF]">Creator</span>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {token.symbol}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-white group-hover:text-[#03E1FF] transition-colors duration-300">
                ${token.price < 0.01 ? token.price.toFixed(8) : token.price.toFixed(2)}
              </p>
              <div className={`flex items-center justify-end space-x-1 text-xs ${
                token.metadata.price_change_24h >= 0
                  ? 'text-emerald-600 dark:text-[#00FFA3]'
                  : 'text-red-600 dark:text-red-500'
              }`}>
                {token.metadata.price_change_24h >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span className="font-medium">
                  {Math.abs(token.metadata.price_change_24h).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Mini Chart */}
          <div className="relative h-[60px] mb-3 group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0F1F]/20" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00FFA3]/5 via-[#03E1FF]/5 to-[#DC1FFF]/5 animate-pulse" />
            </div>
            <div className="relative h-full transform transition-transform duration-500 group-hover:scale-[1.02]">
              <Line 
                options={chartOptions} 
                data={chartData}
                className="transition-opacity duration-500 group-hover:opacity-90"
              />
            </div>
          </div>
        </div>

        {/* Stats and actions section - no modal trigger */}
        <div onClick={(e) => e.stopPropagation()}>
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="p-2 rounded-lg bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-[#03E1FF]/10 group-hover:border-[#03E1FF]/20 transition-all duration-500">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Market Cap</p>
              <p className="font-medium text-xs text-gray-900 dark:text-white group-hover:text-[#03E1FF] transition-colors duration-300">
                {formatNumber(token.metadata.market_cap)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-[#03E1FF]/10 group-hover:border-[#03E1FF]/20 transition-all duration-500">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">24h Volume</p>
              <p className="font-medium text-xs text-gray-900 dark:text-white group-hover:text-[#03E1FF] transition-colors duration-300">
                {formatNumber(token.metadata.volume_24h)}
              </p>
            </div>
          </div>

          {/* Contract address and buttons */}
          <div className="space-y-2">
            <div className="text-[10px] text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-[#0A0F1F]/50 backdrop-blur-xl rounded-lg p-2 border border-gray-200 dark:border-[#03E1FF]/10 transition-colors duration-300">
              <div className="flex items-center justify-between">
                <span className="truncate group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors duration-300 max-w-[80%]">
                  {token.contractAddress}
                </span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!userId) {
                        alert('Please sign in to save tokens');
                        return;
                      }
                      handleSaveToggle(e);
                    }}
                    className={`p-1 rounded-lg transition-colors duration-300 ${
                      isSaved 
                        ? 'text-[#03E1FF] hover:text-[#03E1FF]/80' 
                        : 'text-gray-400 hover:text-[#03E1FF]'
                    }`}
                    title={isSaved ? 'Remove from saved' : 'Save token'}
                  >
                    {isSaved ? (
                      <Star className="w-4 h-4 fill-current" />
                    ) : (
                      <StarOff className="w-4 h-4" />
                    )}
                  </button>
                  {canDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(e);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 rounded-lg transition-colors duration-300"
                      title="Delete Token"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Reactions */}
            {!isLoading && (
              <div className="flex items-center justify-center space-x-2 pt-2">
                <ReactionButton
                  tokenAddress={token.contractAddress}
                  type="rocket"
                  count={reactionCounts.rocket}
                  userReaction={userReaction}
                  onReact={handleReaction}
                />
                <ReactionButton
                  tokenAddress={token.contractAddress}
                  type="poop"
                  count={reactionCounts.poop}
                  userReaction={userReaction}
                  onReact={handleReaction}
                />
                <ReactionButton
                  tokenAddress={token.contractAddress}
                  type="like"
                  count={reactionCounts.like}
                  userReaction={userReaction}
                  onReact={handleReaction}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title={
          <div className="flex items-center justify-between w-full">
            <span>{`${token.name} (${token.symbol})`}</span>
            {canDelete && (
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors duration-300"
                title="Delete Token"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        }
        size="lg"
      >
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
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${token.price.toFixed(6)}
                </h3>
                <div className={`flex items-center space-x-2 ${
                  token.metadata.price_change_24h >= 0
                    ? 'text-emerald-600 dark:text-[#00FFA3]'
                    : 'text-red-600 dark:text-red-500'
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

            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-white/5 rounded-lg p-1">
              {timeframes.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => handleTimeframeChange(tf.value)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-300 ${
                    selectedTimeframe === tf.value
                      ? 'bg-[#03E1FF]/10 text-[#03E1FF]'
                      : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50/5'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative h-[300px]">
            <Line
              options={detailChartOptions}
              data={chartData}
              className="transition-opacity duration-500 group-hover:opacity-90"
            />
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        @media (max-width: 768px) {
          .token-list-container {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            -ms-overflow-style: none;
            padding-bottom: 1rem;
            margin: 0 -1rem;
            padding-left: 1rem;
            padding-right: 1rem;
          }
          .token-list-container::-webkit-scrollbar {
            display: none;
          }
          .token-card {
            scroll-snap-align: start;
            flex-shrink: 0;
          }
        }
      `}</style>
    </>
  );
}