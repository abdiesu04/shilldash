'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { isValidSolanaAddress } from '@/utils/solanaTokenUtils';

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

const tokenSchema = z.object({
  address: z.string().refine((val) => isValidSolanaAddress(val), {
    message: 'Invalid Solana token address',
  }),
  description: z.string().optional()
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

      // Fetch token data using the address
      const response = await fetch(`/api/tokens/${data.address}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch token data');
      }

      const tokenData = await response.json();

      // Save token to database
      const saveResponse = await fetch('/api/tokens/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...tokenData,
          description: data.description
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        if (errorData.message?.includes('already exists')) {
          throw new Error('You have already added this token to your dashboard');
        }
        throw new Error(errorData.error || 'Failed to save token');
      }

      const savedToken = await saveResponse.json();
      if (savedToken.message?.includes('updated successfully')) {
        setError('You have already added this token to your dashboard');
        return;
      }
      
      onSuccess(savedToken);
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
          <label htmlFor="address" className="block text-sm font-medium text-gray-200 mb-1">
            Solana Token Address
          </label>
          <input
            {...register('address')}
            type="text"
            id="address"
            placeholder="Enter Solana token address (e.g., EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v)"
            className="w-full px-4 py-2.5 bg-white/5 border border-[#03E1FF]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#03E1FF]/50 transition-all duration-300 font-mono"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-400">
            Enter a valid Solana token address to automatically fetch token data
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-1">
            Description (Optional)
          </label>
          <textarea
            {...register('description')}
            id="description"
            rows={3}
            placeholder="Enter token description"
            className="w-full px-4 py-2.5 bg-white/5 border border-[#03E1FF]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#03E1FF]/50 transition-all duration-300"
          />
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