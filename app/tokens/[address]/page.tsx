'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
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
  Filler,
} from 'chart.js';
import Image from 'next/image';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TokenData {
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
}

export default function TokenDetail({ params }: { params: Promise<{ address: string }> }) {
  const resolvedParams = use(params);
  const [token, setToken] = useState<TokenData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTokenDetails = async () => {
      try {
        const response = await fetch(`/api/tokens/${resolvedParams.address}`);
        if (!response.ok) throw new Error('Failed to fetch token details');
        const data = await response.json();
        setToken(data.token);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching token details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenDetails();
  }, [resolvedParams.address]);

  const formatNumber = (num: number) => {
    if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`;
    }
    if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    }
    return `$${num.toFixed(2)}`;
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-red-600 dark:text-red-400">
              {error || 'Token not found'}
            </h3>
          </div>
        </div>
      </div>
    );
  }

  const chartData = token.chartData ? {
    labels: token.chartData.labels,
    datasets: [
      {
        label: 'Price',
        data: token.chartData.prices,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
    ],
  } : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-4 mb-6">
            {token.logo && (
              <Image
                src={token.logo}
                alt={`${token.name} logo`}
                width={64}
                height={64}
                className="rounded-full"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {token.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">{token.symbol}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${token.price.toFixed(4)}
              </p>
              <p
                className={`text-sm ${
                  token.metadata.price_change_24h >= 0
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              >
                {token.metadata.price_change_24h >= 0 ? '↑' : '↓'}
                {Math.abs(token.metadata.price_change_24h).toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Market Cap</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {formatNumber(token.metadata.market_cap)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">24h Volume</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {formatNumber(token.metadata.volume_24h)}
              </p>
            </div>
          </div>

          {chartData && (
            <div className="mt-8 h-[400px]">
              <Line options={chartOptions} data={chartData} />
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Contract Address
            </p>
            <p className="mt-1 font-mono text-sm text-gray-900 dark:text-white break-all">
              {token.contractAddress}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 