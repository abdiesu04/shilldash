'use client';

import { useState } from 'react';
import { Search, Loader2, CopyIcon, CheckIcon } from 'lucide-react';

interface AddTokenFormProps {
  onSuccess: () => void;
}

export default function AddTokenForm({ onSuccess }: AddTokenFormProps) {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/tokens/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contractAddress: address }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add token');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add token');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(''), 2000);
  };

  const exampleTokens = [
    {
      name: 'USDC',
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    },
    {
      name: 'BONK',
      address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Token Contract Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-crypto-dark-700 rounded-lg focus:ring-2 focus:ring-crypto-primary focus:border-transparent bg-white dark:bg-crypto-dark-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Enter Solana token address"
            required
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-crypto-danger">{error}</p>
        )}
      </div>

      <div className="bg-gray-50 dark:bg-crypto-dark-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Example Tokens
        </h3>
        <div className="space-y-3">
          {exampleTokens.map((token) => (
            <div
              key={token.address}
              className="flex items-center justify-between p-3 bg-white dark:bg-crypto-dark-800 rounded-lg border border-gray-200 dark:border-crypto-dark-600"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {token.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                  {token.address}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setAddress(token.address)}
                  className="text-xs px-2 py-1 bg-crypto-primary/10 text-crypto-primary rounded-md hover:bg-crypto-primary/20 transition-colors"
                >
                  Use
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(token.address)}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-crypto-dark-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-crypto-dark-600 transition-colors"
                >
                  {copied === token.address ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    <CopyIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-crypto-primary hover:bg-crypto-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-crypto-primary disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            'Add Token'
          )}
        </button>
      </div>
    </form>
  );
} 