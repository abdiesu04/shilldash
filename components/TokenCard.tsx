import Image from 'next/image';
import Link from 'next/link';
import { formatNumber, formatPercentage } from '@/utils/format';
import TokenReactions from './tokens/TokenReactions';

interface TokenCardProps {
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
    chartData?: {
      labels: string[];
      prices: number[];
    };
    onChainData: {
      supply: string;
      decimals: number;
      mintAuthority?: string | null;
      freezeAuthority?: string | null;
      isInitialized?: boolean;
    };
    urls: {
      explorers: {
        solscan: string;
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
  };
  showReactions?: boolean;
  onDelete?: () => void;
  showDeleteButton?: boolean;
}

export default function TokenCard({ token, onDelete, showDeleteButton, showReactions = true }: TokenCardProps) {
  const priceChange = Number(token.metadata.price_change_24h.h24);
  const volume = Number(token.metadata.volume_24h.h24);

  const priceChangeColor = priceChange >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
      {/* Main content section */}
      <div className="p-4 flex-grow">
        <Link href={`/tokens/${token.contractAddress}`} className="block">
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10">
              <Image
                src={token.logo || '/placeholder.png'}
                alt={token.name}
                fill
                className="rounded-full"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{token.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{token.symbol}</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Price</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${formatNumber(token.price)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">24h Change</span>
              <span className={`font-medium ${priceChangeColor}`}>
                {formatPercentage(priceChange)}%
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Market Cap</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${formatNumber(token.metadata.market_cap)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">24h Volume</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${formatNumber(volume)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Liquidity</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${formatNumber(token.metadata.liquidity)}
              </span>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <a
                href={token.urls.explorers.solscan}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                onClick={(e) => e.stopPropagation()}
              >
                View on Solscan ↗
              </a>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Supply: {formatNumber(parseFloat(token.onChainData.supply) / Math.pow(10, token.onChainData.decimals))}
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Reactions section with proper spacing and borders */}
      <div className="mt-auto p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
        {showReactions && <TokenReactions tokenAddress={token.contractAddress} />}
      </div>
    </div>
  );
} 