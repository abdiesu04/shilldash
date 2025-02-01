import Image from 'next/image';
import Link from 'next/link';
import { formatNumber, formatPercentage } from '@/utils/format';

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
      liquidity: number;
    };
    onChainData: {
      supply: string;
      decimals: number;
    };
    urls: {
      explorers: {
        solscan: string;
      };
    };
  };
}

export default function TokenCard({ token }: TokenCardProps) {
  const priceChangeColor = token.metadata.price_change_24h >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <Link href={`/tokens/${token.contractAddress}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
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
              {formatPercentage(token.metadata.price_change_24h)}%
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
              ${formatNumber(token.metadata.volume_24h)}
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
      </div>
    </Link>
  );
} 