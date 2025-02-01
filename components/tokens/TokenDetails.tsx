'use client';

import { useEffect, useState } from 'react';
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
import { formatNumber, formatPrice, formatPercentage } from '@/utils/formatters';
import { ExternalLink, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Register ChartJS components
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

interface TokenDetailsProps {
  token: {
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
    onChainData: {
      supply: string;
      decimals: number;
      mintAuthority: string | null;
      freezeAuthority: string | null;
      isInitialized: boolean;
    };
    urls: {
      explorers: {
        solscan: string;
        solanaFM: string;
        explorer: string;
      };
      trading: {
        raydium: string;
        jupiter: string;
        orca: string;
      };
    };
  };
}

export default function TokenDetails({ token }: TokenDetailsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'m5' | 'h1' | 'h6' | 'h24'>('h24');
  const priceChange = Number(token.metadata.price_change_24h[selectedTimeframe]);
  const volume = Number(token.metadata.volume_24h[selectedTimeframe]);
  const isPriceUp = priceChange >= 0;

  const timeframes = [
    { value: 'm5', label: '5M' },
    { value: 'h1', label: '1H' },
    { value: 'h6', label: '6H' },
    { value: 'h24', label: '24H' },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Token Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img src={token.logo} alt={token.name} className="w-12 h-12 rounded-full" />
          <div>
            <h2 className="text-2xl font-bold text-white">{token.name}</h2>
            <p className="text-gray-400">{token.symbol}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">${formatPrice(token.price)}</p>
          <div className={`flex items-center ${isPriceUp ? 'text-green-500' : 'text-red-500'}`}>
            {isPriceUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{formatPercentage(Math.abs(priceChange))}%</span>
          </div>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex space-x-2">
        {timeframes.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setSelectedTimeframe(value)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              selectedTimeframe === value
                ? 'bg-[#03E1FF]/20 text-[#03E1FF]'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Token Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white/5 rounded-lg">
          <p className="text-sm text-gray-400">Market Cap</p>
          <p className="text-lg font-semibold text-white">${formatNumber(token.metadata.market_cap)}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg">
          <p className="text-sm text-gray-400">Volume ({timeframes.find(t => t.value === selectedTimeframe)?.label})</p>
          <p className="text-lg font-semibold text-white">${formatNumber(volume)}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg">
          <p className="text-sm text-gray-400">Liquidity</p>
          <p className="text-lg font-semibold text-white">${formatNumber(token.metadata.liquidity)}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg">
          <p className="text-sm text-gray-400">Total Supply</p>
          <p className="text-lg font-semibold text-white">{formatNumber(parseFloat(token.onChainData.supply))}</p>
        </div>
      </div>

      {/* On-Chain Data */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">On-Chain Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <p className="text-sm text-gray-400">Mint Authority</p>
            <p className="text-sm font-mono text-white truncate">
              {token.onChainData.mintAuthority || 'None'}
            </p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <p className="text-sm text-gray-400">Freeze Authority</p>
            <p className="text-sm font-mono text-white truncate">
              {token.onChainData.freezeAuthority || 'None'}
            </p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <p className="text-sm text-gray-400">Decimals</p>
            <p className="text-sm text-white">{token.onChainData.decimals}</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <p className="text-sm text-gray-400">Status</p>
            <p className="text-sm text-white">
              {token.onChainData.isInitialized ? 'Initialized' : 'Not Initialized'}
            </p>
          </div>
        </div>
      </div>

      {/* External Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">External Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm text-gray-400">Explorers</h4>
            <div className="flex flex-col space-y-2">
              {Object.entries(token.urls.explorers).map(([name, url]) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <span className="capitalize">{name}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm text-gray-400">Trading</h4>
            <div className="flex flex-col space-y-2">
              {Object.entries(token.urls.trading).map(([name, url]) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <span className="capitalize">Trade on {name}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 