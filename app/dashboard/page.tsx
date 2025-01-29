'use client';

import { useEffect, useState } from 'react';
import TokenCard from '@/components/tokens/TokenCard';
import EmptyTokenGrid from '@/components/tokens/EmptyTokenGrid';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, User, Crown, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import Modal from '@/components/Modal';
import AddTokenForm from '@/components/AddTokenForm';

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

  const renderEmptyState = () => {
    if (viewMode === 'my-tokens') {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-[#00FFA3]/10 via-[#03E1FF]/10 to-[#DC1FFF]/10 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-[#03E1FF]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Created Tokens Yet</h3>
          <p className="text-gray-400 mb-6 max-w-md">
            Start building your token collection. Add tokens you want to track and manage in your personal dashboard.
          </p>
          <Link
            href="/add-token"
            className="group relative flex items-center px-4 py-2 text-sm font-medium text-white overflow-hidden rounded-lg transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] opacity-100 group-hover:opacity-90 transition-opacity duration-300" />
            <div className="absolute inset-[1px] bg-[#0A0F1F] rounded-lg group-hover:bg-transparent transition-all duration-300" />
            <Plus className="w-4 h-4 mr-2 relative z-10" />
            <span className="relative z-10">Create Your First Token</span>
          </Link>
        </div>
      );
    }

    return <EmptyTokenGrid onAddClick={() => router.push('/add-token')} />;
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

  const myTokens = tokens.filter(token => token.clerkUserId === userId);
  const savedTokens = tokens.filter(token => token.isSaved);
  const displayTokens = viewMode === 'my-tokens' 
    ? myTokens 
    : viewMode === 'saved' 
    ? savedTokens 
    : tokens;

  const handleMenuOption = (option: string) => {
    switch (option) {
      case 'your-tokens':
        setViewMode('my-tokens');
        break;
      case 'saved-tokens':
        setViewMode('saved');
        break;
      case 'shill-vision':
        // Implement shill vision feature
        break;
    }
  };

  const handleAddToken = (token: Token) => {
    // Implementation of handleAddToken
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
    <div className="min-h-screen bg-[#0A0F1F] pt-20">
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
                <p className="mt-2 text-gray-400">
                  Discover and track the latest tokens in the crypto space
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-white/5 rounded-xl p-1 backdrop-blur-xl border border-[#03E1FF]/20">
                  {viewModes.map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setViewMode(mode.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        viewMode === mode.value
                          ? 'bg-gradient-to-r from-[#00FFA3]/10 via-[#03E1FF]/10 to-[#DC1FFF]/10 text-white shadow-[0_0_20px_-12px_rgba(0,255,163,0.5)]'
                          : 'text-gray-400 hover:text-white'
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
                    className="bg-white/5 rounded-xl h-[300px] backdrop-blur-xl border border-[#03E1FF]/10"
                  />
                ))}
              </div>
            ) : tokens.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
                  {tokens.map((token, index) => (
                    <div
                      key={token.contractAddress}
                      className="transform transition-all duration-500 hover:z-10"
                      style={{
                        animationDelay: `${index * 100}ms`,
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
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 bg-white/5 rounded-xl backdrop-blur-xl border border-[#03E1FF]/20">
                <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-r from-[#00FFA3]/10 via-[#03E1FF]/10 to-[#DC1FFF]/10 flex items-center justify-center">
                  <Inbox className="w-8 h-8 text-[#03E1FF]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Tokens Found</h3>
                <p className="text-gray-400 text-center max-w-md">
                  {viewMode === 'my-tokens'
                    ? "You haven't added any tokens yet. Start by adding your first token!"
                    : 'No tokens match your current filters. Try adjusting your search criteria.'}
                </p>
                {viewMode === 'my-tokens' && (
                  <button
                    onClick={() => setShowAddToken(true)}
                    className="mt-6 px-6 py-2 bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] rounded-lg text-white font-medium hover:opacity-90 transition-opacity duration-300"
                  >
                    Add Your First Token
                  </button>
                )}
              </div>
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
        <AddTokenForm onSuccess={handleAddToken} />
      </Modal>
    </div>
  );
} 