'use client';

import { useState, useEffect, useRef } from 'react';
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
} from 'chart.js';
import { Sparkles, TrendingUp, TrendingDown, Clock, ChevronRight, Trash2, Crown, Shield } from 'lucide-react';
import Modal from '../ui/Modal';
import type { ChartData, ScriptableContext } from 'chart.js';
import { useSession } from '@clerk/nextjs';
import type { ReactNode } from 'react';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';

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

// Define chart animations with more subtle effects
const animations = {
  y: {
    easing: 'easeOutQuart',
    duration: 1000,
    from: (ctx: any) => {
      if (ctx.type === 'data') {
        if (ctx.mode === 'default' && !ctx.dropped) {
          ctx.dropped = true;
          return ctx.dataset.data[ctx.dataIndex];
        }
      }
      return false;
    }
  }
};

const getChartBounds = (data: number[]) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const padding = (max - min) * 0.05;
  return {
    suggestedMin: min - padding,
    suggestedMax: max + padding,
  };
};

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
  };
  onDelete?: () => void;
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

export default function TokenCard({ token, onDelete, showDeleteButton }: TokenCardProps) {
  const { session } = useSession();
  const { userId } = useAuth();
  const canDelete = showDeleteButton && userId && token.clerkUserId === userId;
  const isMyToken = userId && token.clerkUserId === userId;

  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [isChartLoading, setIsChartLoading] = useState(false);

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

  // Enhanced chart options with stable animations
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
        backgroundColor: 'rgba(10, 15, 31, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
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
          label: function(context: any) {
            return `$${Number(context.parsed.y).toFixed(6)}`;
          },
          title: function(context: any) {
            const value = context[0].parsed.x;
            if (selectedTimeframe === '1h') {
              return `${value}m ago`;
            } else if (selectedTimeframe === '24h') {
              return `${value}h ago`;
            } else if (selectedTimeframe === '7d') {
              return `${value}d ago`;
            } else {
              return `${value}d ago`;
            }
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
        ticks: {
          display: false,
        },
        min: 0,
      },
      y: {
        type: 'linear' as const,
        display: false,
        grid: {
          display: false,
        },
        ticks: {
          display: false,
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
        hoverBackgroundColor: token.metadata.price_change_24h >= 0 ? '#00FFA3' : '#FF3B3B',
        borderWidth: 2,
        borderColor: '#0A0F1F',
      },
      line: {
        tension: 0.4,
        borderWidth: 2,
        borderCapStyle: 'round' as const,
        borderJoinStyle: 'round' as const,
        cubicInterpolationMode: 'monotone' as const,
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
        borderColor: token.metadata.price_change_24h >= 0 ? '#00FFA3' : '#FF3B3B',
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          if (token.metadata.price_change_24h >= 0) {
            gradient.addColorStop(0, 'rgba(0, 255, 163, 0.12)');
            gradient.addColorStop(0.5, 'rgba(0, 255, 163, 0.05)');
            gradient.addColorStop(1, 'rgba(0, 255, 163, 0)');
          } else {
            gradient.addColorStop(0, 'rgba(255, 59, 59, 0.12)');
            gradient.addColorStop(0.5, 'rgba(255, 59, 59, 0.05)');
            gradient.addColorStop(1, 'rgba(255, 59, 59, 0)');
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
    setIsChartLoading(true);
    setSelectedTimeframe(timeframe);
    // Simulate loading state for demo
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsChartLoading(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent modal from opening
    if (!canDelete || !onDelete) return;

    try {
      const response = await fetch(`/api/tokens/${token.contractAddress}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDelete();
      }
    } catch (error) {
      console.error('Error deleting token:', error);
    }
  };

  return (
    <>
      <div
        className={`group relative bg-gradient-to-br from-[#0A0F1F] to-[#151933] rounded-xl border border-[#03E1FF]/20 hover:border-[#03E1FF]/40 transition-all duration-500 p-4 cursor-pointer transform ${
          isHovered ? 'scale-[1.02] shadow-[0_0_30px_-12px_rgba(0,255,163,0.3)]' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setShowDetails(true)}
      >
        {/* Premium decorative elements */}
        <div className="absolute -top-px left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#03E1FF]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -left-px top-[10%] bottom-[10%] w-[1px] bg-gradient-to-b from-transparent via-[#03E1FF]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -right-px top-[10%] bottom-[10%] w-[1px] bg-gradient-to-b from-transparent via-[#03E1FF]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -bottom-px left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#03E1FF]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {token.logo && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00FFA3] to-[#03E1FF] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur" />
                  <Image
                    src={token.logo}
                    alt={`${token.name} logo`}
                    width={36}
                    height={36}
                    className="relative rounded-full ring-2 ring-[#03E1FF]/20 group-hover:ring-[#03E1FF]/40 transition-all duration-500"
                  />
                </div>
              )}
              {token.metadata.price_change_24h > 5 && (
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-3 h-3 text-[#00FFA3] animate-pulse" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-white text-base group-hover:text-[#03E1FF] transition-colors duration-300">
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
              <p className="text-xs text-gray-400">
                {token.symbol}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-white text-sm group-hover:text-[#03E1FF] transition-colors duration-300">
              ${token.price < 0.01 ? token.price.toFixed(8) : token.price.toFixed(2)}
            </p>
            <div className={`flex items-center justify-end space-x-1 text-xs ${
              token.metadata.price_change_24h >= 0
                ? 'text-[#00FFA3]'
                : 'text-red-500'
            }`}>
              {token.metadata.price_change_24h >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{Math.abs(token.metadata.price_change_24h).toFixed(2)}%</span>
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

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="p-2 rounded-lg bg-white/5 backdrop-blur-xl border border-[#03E1FF]/10 group-hover:border-[#03E1FF]/20 transition-all duration-500">
            <p className="text-[10px] text-gray-400 mb-0.5">Market Cap</p>
            <p className="font-medium text-xs text-white group-hover:text-[#03E1FF] transition-colors duration-300">
              {formatNumber(token.metadata.market_cap)}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-white/5 backdrop-blur-xl border border-[#03E1FF]/10 group-hover:border-[#03E1FF]/20 transition-all duration-500">
            <p className="text-[10px] text-gray-400 mb-0.5">24h Volume</p>
            <p className="font-medium text-xs text-white group-hover:text-[#03E1FF] transition-colors duration-300">
              {formatNumber(token.metadata.volume_24h)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
          <span className="truncate group-hover:text-gray-400 transition-colors duration-300 max-w-[80%]">
            {token.contractAddress}
          </span>
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(e);
              }}
              className="ml-2 p-1 rounded-md text-red-500 hover:bg-red-500/10 transition-colors duration-300"
              title="Delete Token"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

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

            <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-1">
              {timeframes.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => handleTimeframeChange(tf.value)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-300 ${
                    selectedTimeframe === tf.value
                      ? 'bg-[#03E1FF]/10 text-[#03E1FF]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{tf.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chart Container */}
          {chartData && (
            <div className="relative">
              <div className="h-[400px] w-full bg-white/5 rounded-xl border border-[#03E1FF]/10 p-6">
                {isChartLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#0A0F1F]/50 backdrop-blur-sm rounded-xl z-10">
                    <div className="w-12 h-12 rounded-full border-2 border-[#03E1FF] border-t-transparent animate-spin" />
                  </div>
                ) : (
                  <div className="relative h-full">
                    <Line
                      options={detailChartOptions}
                      data={chartData}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

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
      </Modal>
    </>
  );
} 