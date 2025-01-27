'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

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
  };
}

export default function TokenCard({ token }: TokenCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const formatNumber = (num: number) => {
    if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`;
    }
    if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    }
    return `$${num.toFixed(2)}`;
  };

  const handleClick = () => {
    router.push(`/tokens/${token.contractAddress}`);
  };

  const miniChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
    elements: {
      point: {
        radius: 0,
      },
      line: {
        tension: 0.4,
        borderWidth: 1.5,
      },
    },
  };

  const chartData = token.chartData ? {
    labels: token.chartData.labels,
    datasets: [
      {
        data: token.chartData.prices,
        borderColor: token.metadata.price_change_24h >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
        backgroundColor: token.metadata.price_change_24h >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        fill: true,
      },
    ],
  } : null;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 cursor-pointer ${
        isHovered ? 'transform scale-[1.02]' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {token.logo && (
            <Image
              src={token.logo}
              alt={`${token.name} logo`}
              width={40}
              height={40}
              className="rounded-full"
            />
          )}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white">
              {token.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {token.symbol}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-800 dark:text-white">
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

      {chartData && (
        <div className="mt-4 h-[100px]">
          <Line options={miniChartOptions} data={chartData} />
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Market Cap</p>
          <p className="font-medium text-gray-800 dark:text-white">
            {formatNumber(token.metadata.market_cap)}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">24h Volume</p>
          <p className="font-medium text-gray-800 dark:text-white">
            {formatNumber(token.metadata.volume_24h)}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {token.contractAddress}
        </p>
      </div>
    </div>
  );
} 