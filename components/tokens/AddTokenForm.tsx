'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle } from 'lucide-react';

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
  description?: string;
}

interface AddTokenFormProps {
  onSuccess: (token: Token) => void;
}

const schema = z.object({
  contractAddress: z.string().min(1, 'Contract address is required'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AddTokenForm({ onSuccess }: AddTokenFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTokenExists, setIsTokenExists] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError('');
    setIsTokenExists(false);

    try {
      const response = await fetch('/api/tokens/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409 || result.message?.toLowerCase().includes('already exists')) {
          setIsTokenExists(true);
          setError('Token already added');
        } else {
          throw new Error(result.message || 'Failed to add token');
        }
        return;
      }

      reset();
      onSuccess(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add token');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className={`p-4 rounded-lg ${isTokenExists ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
          <div className="flex items-start space-x-3">
            <AlertCircle className={`w-5 h-5 ${isTokenExists ? 'text-blue-500 dark:text-blue-400' : 'text-red-500 dark:text-red-400'} flex-shrink-0 mt-0.5`} />
            <div>
              <h4 className={`text-sm font-medium ${isTokenExists ? 'text-blue-800 dark:text-blue-200' : 'text-red-800 dark:text-red-200'}`}>
                {isTokenExists ? 'Token Already Added' : 'Error'}
              </h4>
              <p className={`text-sm ${isTokenExists ? 'text-blue-600 dark:text-blue-300' : 'text-red-600 dark:text-red-300'} mt-1`}>
                {error}
              </p>
              {isTokenExists && (
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-2">
                  View in dashboard
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="contractAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Contract Address
        </label>
        <input
          {...register('contractAddress')}
          type="text"
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[#03E1FF] focus:border-[#03E1FF] sm:text-sm"
          placeholder="Enter token contract address"
        />
        {errors.contractAddress && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.contractAddress.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description (Optional)
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[#03E1FF] focus:border-[#03E1FF] sm:text-sm"
          placeholder="Add a description for this token"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#00FFA3] to-[#03E1FF] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#03E1FF] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Adding Token...' : 'Add Token'}
      </button>
    </form>
  );
} 