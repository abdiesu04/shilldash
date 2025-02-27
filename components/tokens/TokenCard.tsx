import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Scale,
  CoreScaleOptions,
} from 'chart.js';
import { TrendingUp, TrendingDown, Trash2, Crown, Star, StarOff, Copy, Check } from 'lucide-react';
import Modal from '../ui/Modal';
import type { ChartData, ScriptableContext } from 'chart.js';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import TokenReactions from './TokenReactions';

// Register Chart.js plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
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

// Chart types
interface ChartCallbackType {
  parsed: {
    x: number;
    y: number;
  };
}

// Format large numbers in a readable way
const formatLargeNumber = (num: number): string => {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
};

// Format price based on its value
const formatPrice = (price: number): string => {
  if (price < 0.00001) return price.toExponential(2);
  if (price < 0.01) return price.toFixed(6);
  if (price < 1) return price.toFixed(4);
  if (price < 10000) return price.toFixed(2);
  return formatLargeNumber(price);
};

// Format token name to fit in the card
const formatTokenName = (name: string): string => {
  if (name.length > 20) {
    return name.slice(0, 18) + '...';
  }
  return name;
};

export default function TokenCard({ token, onDelete, showDeleteButton }: TokenCardProps) {
  const { userId } = useAuth();
  const router = useRouter();
  const canDelete = showDeleteButton && userId && token.clerkUserId === userId;
  const isMyToken = userId && token.clerkUserId === userId;

  const [showDetails, setShowDetails] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [isSaved, setIsSaved] = useState(token.isSaved || false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Update saved state when token.isSaved changes
    setIsSaved(token.isSaved || false);
  }, [token.isSaved]);

  const prices = token.chartData?.prices || generateChartData(token.price).prices;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceMargin = (maxPrice - minPrice) * 0.05;

  // Enhanced chart options with light/dark theme support
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: 'easeOutQuart' as const,
    },
    interaction: {
      intersect: false,
      mode: 'nearest' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1F2937',
        bodyColor: '#1F2937',
        padding: 12,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
          family: 'Inter',
        },
        bodyFont: {
          size: 13,
          family: 'Inter',
        },
        callbacks: {
          label: (context: ChartCallbackType): string => {
            return `$${Number(context.parsed.y).toFixed(6)}`;
          },
          title: (context: ChartCallbackType[]): string => {
            const value = context[0].parsed.x;
            if (selectedTimeframe === '1h') return `${value}m ago`;
            if (selectedTimeframe === '24h') return `${value}h ago`;
            return `${value}d ago`;
          }
        },
      },
    },
    scales: {
      x: {
        type: 'linear' as const,
        display: false,
        grid: {
          display: false,
        },
      },
      y: {
        type: 'linear' as const,
        display: false,
        grid: {
          display: false,
        },
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
        borderCapStyle: 'round' as const,
        borderJoinStyle: 'round' as const,
        cubicInterpolationMode: 'monotone' as const,
        borderColor: token.metadata.price_change_24h >= 0 
          ? 'rgb(16, 185, 129)'
          : 'rgb(239, 68, 68)',
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          const color = token.metadata.price_change_24h >= 0 
            ? 'rgba(16, 185, 129, 1)'
            : 'rgba(239, 68, 68, 1)';
          gradient.addColorStop(0, color.replace('1)', '0.1)'));
          gradient.addColorStop(1, color.replace('1)', '0)'));
          return gradient;
        },
      },
    },
  };

  // Enhanced detail chart options for modal with light/dark theme support
  const detailChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        titleColor: '#1F2937',
        bodyColor: '#1F2937',
        borderColor: 'rgba(226, 232, 240, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        type: 'linear' as const,
        display: true,
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          drawBorder: false,
        },
        ticks: {
          color: '#64748B',
          font: {
            size: 12,
            family: 'Inter',
          },
          maxRotation: 0,
          padding: 8,
          callback: function(this: Scale<CoreScaleOptions>, tickValue: string | number): string {
            const value = Number(tickValue);
            if (selectedTimeframe === '1h') return `${value}m`;
            if (selectedTimeframe === '24h') return `${value}h`;
            return `${value}d`;
          },
        },
        border: {
          display: false,
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          drawBorder: false,
          lineWidth: 1,
        },
        ticks: {
          color: '#64748B',
          font: {
            size: 12,
            family: 'Inter',
          },
          padding: 12,
          callback: function(this: Scale<CoreScaleOptions>, tickValue: string | number): string {
            return `$${Number(tickValue).toFixed(2)}`;
          }
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
    setSelectedTimeframe(timeframe);
    // Simulate loading state for demo
    await new Promise(resolve => setTimeout(resolve, 1000));
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
    e.stopPropagation();
    if (!userId) {
      router.push('/sign-in');
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/tokens/${token.contractAddress}/save`, {
        method: isSaved ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update saved status');
      }

      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error updating saved status:', error);
      setError(error instanceof Error ? error.message : 'Failed to update saved status');
      setTimeout(() => setError(''), 3000); // Clear error after 3 seconds
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAddress = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(token.contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Get the clicked element
    const target = e.target as HTMLElement;
    
    // Check if the click is on the chart, logo, name, or their containers
    const isChartClick = target.closest('.chart-section') !== null;
    const isHeaderClick = target.closest('.token-header') !== null;
    
    if (isChartClick || isHeaderClick) {
      setShowDetails(true);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative w-full bg-white dark:bg-[#0A0F1F] rounded-lg border border-gray-200 dark:border-[#03E1FF]/10 hover:border-[#03E1FF]/30 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Decorative Edges */}
      <div className="absolute -top-px left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#03E1FF]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -left-px top-[10%] bottom-[10%] w-[1px] bg-gradient-to-b from-transparent via-[#03E1FF]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -right-px top-[10%] bottom-[10%] w-[1px] bg-gradient-to-b from-transparent via-[#03E1FF]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -bottom-px left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#03E1FF]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Main Content Container */}
      <div className="flex flex-col h-full">
        {/* Token Header */}
        <div className="p-2.5 border-b border-gray-100 dark:border-gray-800 token-header">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5 max-w-[70%]">
              <div className="relative flex-shrink-0">
                <Image
                  src={token.logo}
                  alt={`${token.name} logo`}
                  width={32}
                  height={32}
                  className="rounded-full ring-2 ring-gray-200 dark:ring-[#03E1FF]/20 group-hover:ring-[#03E1FF]/40 transition-all duration-300"
                />
                {token.metadata.price_change_24h > 5 && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-3 h-3 rounded-full bg-emerald-100 dark:bg-[#00FFA3]/10 flex items-center justify-center">
                      <TrendingUp className="w-2 h-2 text-emerald-600 dark:text-[#00FFA3]" />
                    </div>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-semibold text-xs text-gray-900 dark:text-white group-hover:text-[#03E1FF] transition-colors duration-300 truncate">
                    {formatTokenName(token.name)}
                  </h3>
                  {isMyToken && (
                    <div className="flex-shrink-0 px-1 py-0.5 rounded bg-gradient-to-r from-[#00FFA3]/10 via-[#03E1FF]/10 to-[#DC1FFF]/10 backdrop-blur-sm border border-[#03E1FF]/20">
                      <div className="flex items-center space-x-0.5">
                        <Crown className="w-2 h-2 text-[#03E1FF]" />
                        <span className="text-[8px] font-medium text-[#03E1FF]">Creator</span>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                  {token.symbol}
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-semibold text-xs text-gray-900 dark:text-white group-hover:text-[#03E1FF] transition-colors duration-300">
                {formatPrice(token.price)}
              </p>
              <div className={`flex items-center justify-end space-x-0.5 text-[9px] ${
                token.metadata.price_change_24h >= 0
                  ? 'text-emerald-600 dark:text-[#00FFA3]'
                  : 'text-red-600 dark:text-red-500'
              }`}>
                {token.metadata.price_change_24h >= 0 ? (
                  <TrendingUp className="w-2 h-2" />
                ) : (
                  <TrendingDown className="w-2 h-2" />
                )}
                <span className="font-medium whitespace-nowrap">
                  {Math.abs(token.metadata.price_change_24h).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="p-2.5 border-b border-gray-100 dark:border-gray-800 chart-section">
          <div className="relative h-[50px]">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0F1F]/20" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00FFA3]/5 via-[#03E1FF]/5 to-[#DC1FFF]/5 animate-pulse" />
            </div>
            <Line 
              options={chartOptions} 
              data={chartData}
              className="transition-opacity duration-500 group-hover:opacity-90"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-2.5 border-b border-gray-100 dark:border-gray-800" onClick={(e) => e.stopPropagation()}>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-[#03E1FF]/10">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 mb-0.5">Market Cap</p>
              <p className="font-medium text-[10px] text-gray-900 dark:text-white">
                {formatLargeNumber(token.metadata.market_cap)}
              </p>
            </div>
            <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-[#03E1FF]/10">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 mb-0.5">24h Volume</p>
              <p className="font-medium text-[10px] text-gray-900 dark:text-white">
                {formatLargeNumber(token.metadata.volume_24h)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer with Address and Actions */}
        <div className="p-2.5 mt-auto" onClick={(e) => e.stopPropagation()}>
          {/* Contract Address */}
          <div className="flex items-center justify-between mb-1.5 p-1 rounded-lg bg-gray-50 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-[#03E1FF]/10">
            <div className="flex items-center space-x-1.5 min-w-0 flex-1">
              <span className="text-[9px] text-gray-500 dark:text-gray-400 font-mono truncate">
                {token.contractAddress}
              </span>
              <button
                onClick={handleCopyAddress}
                className="flex-shrink-0 p-0.5 hover:bg-white/10 rounded transition-colors duration-300"
                title="Copy Address"
              >
                {copied ? (
                  <Check className="w-2.5 h-2.5 text-[#00FFA3]" />
                ) : (
                  <Copy className="w-2.5 h-2.5 text-gray-400 hover:text-[#03E1FF]" />
                )}
              </button>
            </div>
          </div>

          {/* Actions Row */}
          <div className="flex items-center justify-between">
            {/* Reactions on the left */}
            <div className="flex-1">
              <TokenReactions tokenAddress={token.contractAddress} />
            </div>

            {/* Actions on the right */}
            <div className="flex items-center space-x-1">
              <div className="relative">
                {error && (
                  <div className="absolute bottom-full right-0 mb-1.5 w-40 p-1.5 text-[9px] text-red-500 bg-red-500/10 border border-red-500/20 rounded">
                    {error}
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveToggle(e);
                  }}
                  disabled={isLoading}
                  className={`p-1 rounded transition-all duration-300 hover:bg-gray-50 dark:hover:bg-white/5 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    isSaved 
                      ? 'text-[#03E1FF]' 
                      : 'text-gray-400 hover:text-[#03E1FF]'
                  }`}
                >
                  {isSaved ? (
                    <Star className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <StarOff className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              {canDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(e);
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors duration-300 hover:bg-gray-50 dark:hover:bg-white/5"
                  title="Delete Token"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Token Details Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title={token.name}
        size="lg"
      >
        <div className="space-y-6 bg-white dark:bg-[#0A0F1F]">
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

          <div className="relative h-[300px] bg-white dark:bg-[#0A0F1F]">
            <Line
              options={detailChartOptions}
              data={chartData}
              className="transition-opacity duration-500"
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
    </div>
  );
}