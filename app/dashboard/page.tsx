'use client';

import { useEffect, useState } from 'react';
import TokenCard from '@/components/tokens/TokenCard';
import EmptyTokenGrid from '@/components/tokens/EmptyTokenGrid';
import TrendingTokens from '@/components/tokens/TrendingTokens';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, User, Crown, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import AddTokenForm from '@/components/tokens/AddTokenForm';

interface Token {
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
  clerkUserId?: string;
  isSaved?: boolean;
}

const viewModes = [
  { value: 'all', label: 'All Tokens' },
  { value: 'my-tokens', label: 'My Tokens' },
  { value: 'saved', label: 'Saved' }
];

export default function Dashboard() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [tokenToDelete, setTokenToDelete] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const searchParams = useSearchParams();
  const viewMode = searchParams?.get('view') || 'all';
  const { userId, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [showAddToken, setShowAddToken] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn && (viewMode === 'my-tokens' || viewMode === 'saved')) {
      router.push('/sign-in');
      return;
    }
    fetchTokens();
  }, [page, viewMode, isLoaded, isSignedIn]);

  const fetchTokens = async () => {
    try {
      setIsLoading(true);
      setError('');

      if ((viewMode === 'my-tokens' || viewMode === 'saved') && !isSignedIn) {
        throw new Error('Please sign in to view your tokens');
      }

      const response = await fetch(`/api/tokens/list?page=${page}&limit=9${viewMode === 'my-tokens' ? '&userId=' + userId : ''}`);
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please sign in again.');
        }
        throw new Error('Failed to fetch tokens');
      }
      
      const data = await response.json();
      setTokens(data.tokens);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      setError(error instanceof Error ? error.message : 'Error fetching tokens');
      if (error instanceof Error && error.message.includes('Authentication')) {
        router.push('/sign-in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (contractAddress: string) => {
    setTokenToDelete(contractAddress);
    setShowConfirmDialog(true);
  };

  const handleCancelDelete = () => {
    setTokenToDelete(null);
    setShowConfirmDialog(false);
  };

  const handleDeleteToken = async (contractAddress: string) => {
    try {
      if (!isSignedIn) {
        throw new Error('Please sign in to delete tokens');
      }

      const response = await fetch(`/api/tokens/${contractAddress}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok && response.status !== 404) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please sign in again.');
        }
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete token');
      }

      // Remove the token from the local state
      setTokens(prevTokens => prevTokens.filter(token => token.contractAddress !== contractAddress));
      
      // Show success message
      setSuccessMessage('Token deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Close the confirmation dialog
      setShowConfirmDialog(false);
      setTokenToDelete(null);

      // Refresh the tokens list
      fetchTokens();
    } catch (error) {
      console.error('Error deleting token:', error);
      if (error instanceof Error && error.message.includes('Authentication')) {
        router.push('/sign-in');
      }
      // Show error message to user
      setError(error instanceof Error ? error.message : 'Failed to delete token');
      setTimeout(() => setError(''), 3000);
    }
  };

  const setViewMode = (mode: string) => {
    router.push(`/dashboard?view=${mode}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0F1F] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-[#03E1FF] border-t-transparent animate-spin" />
              <div className="absolute inset-0 bg-[#03E1FF] rounded-full animate-pulse opacity-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0F1F] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-red-500">
              {error}
            </h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0F1F] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section with Premium Styling */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00FFA3]/5 via-[#03E1FF]/5 to-[#DC1FFF]/5 blur-3xl" />
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] bg-clip-text text-transparent">
                  Token Dashboard
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Discover and track the latest tokens in the crypto space
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-white dark:bg-white/5 rounded-xl p-1 backdrop-blur-xl border border-gray-200 dark:border-[#03E1FF]/20">
                  {viewModes.map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setViewMode(mode.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        viewMode === mode.value
                          ? 'bg-gradient-to-r from-[#00FFA3]/10 via-[#03E1FF]/10 to-[#DC1FFF]/10 text-gray-900 dark:text-white shadow-[0_0_20px_-12px_rgba(0,255,163,0.5)]'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Trending Tokens Section - Sticky on Desktop */}
          <div className="col-span-12 lg:col-span-3 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)]">
            <TrendingTokens />
          </div>

          {/* Token Grid with Premium Layout */}
          <div className="col-span-12 lg:col-span-9">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-white/5 rounded-xl h-[300px] backdrop-blur-xl border border-gray-200 dark:border-[#03E1FF]/10"
                  />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
                  {/* Add Token Card - Always First */}
                  <div className="transform transition-all duration-500 hover:z-10">
                    <div
                      onClick={() => setShowAddToken(true)}
                      className="group relative bg-white dark:bg-gradient-to-br dark:from-[#0A0F1F] dark:to-[#151933] rounded-xl border border-gray-200 dark:border-[#03E1FF]/20 hover:border-[#03E1FF]/40 transition-all duration-500 p-4 cursor-pointer h-full"
                    >
                      <div className="absolute -top-px left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#03E1FF]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute -left-px top-[10%] bottom-[10%] w-[1px] bg-gradient-to-b from-transparent via-[#03E1FF]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute -right-px top-[10%] bottom-[10%] w-[1px] bg-gradient-to-b from-transparent via-[#03E1FF]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute -bottom-px left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#03E1FF]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#00FFA3]/10 via-[#03E1FF]/10 to-[#DC1FFF]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                          <Plus className="w-8 h-8 text-[#03E1FF] group-hover:rotate-180 transition-transform duration-500" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-[#03E1FF] transition-colors duration-300">
                            Add New Token
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-[200px] mx-auto">
                            Track and manage your favorite tokens
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Existing Token Cards */}
                  {tokens.map((token, index) => (
                    <div
                      key={token.contractAddress}
                      className="transform transition-all duration-500 hover:z-10"
                      style={{
                        animationDelay: `${(index + 1) * 100}ms`,
                      }}
                    >
                      <TokenCard
                        token={token}
                        onDelete={handleDeleteToken}
                        showDeleteButton={viewMode === 'my-tokens'}
                      />
                    </div>
                  ))}
                </div>

                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="inline-flex items-center bg-white/5 rounded-xl p-1 backdrop-blur-xl border border-[#03E1FF]/20">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-lg text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i + 1)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-300 ${
                            page === i + 1
                              ? 'bg-gradient-to-r from-[#00FFA3]/10 via-[#03E1FF]/10 to-[#DC1FFF]/10 text-white shadow-[0_0_20px_-12px_rgba(0,255,163,0.5)]'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded-lg text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Token Modal */}
      <Modal
        isOpen={showAddToken}
        onClose={() => setShowAddToken(false)}
        title="Add New Token"
        size="md"
      >
        <AddTokenForm onSuccess={() => setShowAddToken(false)} />
      </Modal>
    </div>
  );
} 