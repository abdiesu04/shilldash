'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

interface AddTokenFormProps {
  onSuccess: (token: any) => void;
}

const tokenSchema = z.object({
  name: z.string().min(1, 'Token name is required'),
  symbol: z.string().min(1, 'Token symbol is required'),
  contractAddress: z.string().min(42, 'Invalid contract address').max(42, 'Invalid contract address'),
  logo: z.string().url('Invalid logo URL'),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Price must be a positive number',
  }),
  marketCap: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Market cap must be a non-negative number',
  }),
  volume24h: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Volume must be a non-negative number',
  }),
});

type FormData = z.infer<typeof tokenSchema>;

export default function AddTokenForm({ onSuccess }: AddTokenFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(tokenSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setError('');

      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          price: Number(data.price),
          metadata: {
            market_cap: Number(data.marketCap),
            volume_24h: Number(data.volume24h),
            price_change_24h: 0, // Default value for new tokens
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add token');
      }

      const token = await response.json();
      onSuccess(token);
      reset();
    } catch (error) {
      console.error('Error adding token:', error);
      setError(error instanceof Error ? error.message : 'Failed to add token');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-1">
            Token Name
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            placeholder="e.g., Ethereum"
            className="w-full px-4 py-2.5 bg-white/5 border border-[#03E1FF]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#03E1FF]/50 transition-all duration-300"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-200 mb-1">
            Token Symbol
          </label>
          <input
            {...register('symbol')}
            type="text"
            id="symbol"
            placeholder="e.g., ETH"
            className="w-full px-4 py-2.5 bg-white/5 border border-[#03E1FF]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#03E1FF]/50 transition-all duration-300"
          />
          {errors.symbol && (
            <p className="mt-1 text-sm text-red-500">{errors.symbol.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="contractAddress" className="block text-sm font-medium text-gray-200 mb-1">
            Contract Address
          </label>
          <input
            {...register('contractAddress')}
            type="text"
            id="contractAddress"
            placeholder="0x..."
            className="w-full px-4 py-2.5 bg-white/5 border border-[#03E1FF]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#03E1FF]/50 transition-all duration-300 font-mono"
          />
          {errors.contractAddress && (
            <p className="mt-1 text-sm text-red-500">{errors.contractAddress.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-gray-200 mb-1">
            Logo URL
          </label>
          <input
            {...register('logo')}
            type="url"
            id="logo"
            placeholder="https://..."
            className="w-full px-4 py-2.5 bg-white/5 border border-[#03E1FF]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#03E1FF]/50 transition-all duration-300"
          />
          {errors.logo && (
            <p className="mt-1 text-sm text-red-500">{errors.logo.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-200 mb-1">
            Current Price (USD)
          </label>
          <input
            {...register('price')}
            type="number"
            step="any"
            id="price"
            placeholder="0.00"
            className="w-full px-4 py-2.5 bg-white/5 border border-[#03E1FF]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#03E1FF]/50 transition-all duration-300"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="marketCap" className="block text-sm font-medium text-gray-200 mb-1">
            Market Cap (USD)
          </label>
          <input
            {...register('marketCap')}
            type="number"
            step="any"
            id="marketCap"
            placeholder="0.00"
            className="w-full px-4 py-2.5 bg-white/5 border border-[#03E1FF]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#03E1FF]/50 transition-all duration-300"
          />
          {errors.marketCap && (
            <p className="mt-1 text-sm text-red-500">{errors.marketCap.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="volume24h" className="block text-sm font-medium text-gray-200 mb-1">
            24h Volume (USD)
          </label>
          <input
            {...register('volume24h')}
            type="number"
            step="any"
            id="volume24h"
            placeholder="0.00"
            className="w-full px-4 py-2.5 bg-white/5 border border-[#03E1FF]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#03E1FF]/50 transition-all duration-300"
          />
          {errors.volume24h && (
            <p className="mt-1 text-sm text-red-500">{errors.volume24h.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full relative flex items-center justify-center px-6 py-3 text-sm font-medium text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] opacity-100 group-hover:opacity-90 transition-opacity duration-300" />
        <span className="relative flex items-center">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding Token...
            </>
          ) : (
            'Add Token'
          )}
        </span>
      </button>
    </form>
  );
} 