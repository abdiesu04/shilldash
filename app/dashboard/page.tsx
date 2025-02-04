'use client';

import { useEffect, useState } from 'react';
import TokenCard from '@/components/tokens/TokenCard';
import TrendingTokens from '@/components/tokens/TrendingTokens';
import Link from 'next/link';
import { useAuth, SignInButton } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, User, Crown, AlertTriangle, Inbox, Search, X, CheckCircle2 } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const searchParams = useSearchParams();
  const viewMode = searchParams?.get('view') || 'all';
  const { userId, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [showAddToken, setShowAddToken] = useState(false);

  useEffect(() => {
    if (!isLoaded) return; // Wait for auth to load
    
    if ((viewMode === 'my-tokens' || viewMode === 'saved') && !isSignedIn) {
      router.push('/sign-in');
      return;
    }
    
    fetchTokens();
  }, [page, viewMode, isLoaded, isSignedIn, userId]);

  const fetchTokens = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Only check authentication for my-tokens and saved views
      if ((viewMode === 'my-tokens' || viewMode === 'saved') && !isSignedIn) {
        if (!isLoaded) {
          // Still loading auth state, wait
          return;
        }
        router.push('/sign-in');
        return;
      }

      const url = `/api/tokens/list?page=${page}&limit=9&view=${viewMode}`;

      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/sign-in');
          return;
        }
        throw new Error(data.error || 'Failed to fetch tokens');
      }

      setTokens(data.tokens || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      setError(error instanceof Error ? error.message : 'Error fetching tokens');
      setTokens([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
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

  // Add filtered tokens logic
  const filteredTokens = tokens.filter(token => 
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTokenClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      return; // The SignInButton component will handle the click
    }
    setShowAddToken(true);
  };

  // Add this empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Inbox className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {viewMode === 'my-tokens' 
          ? "You haven't added any tokens yet"
          : viewMode === 'saved'
          ? "You haven't saved any tokens yet"
          : "No tokens found"}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
        {viewMode === 'my-tokens' 
          ? "Get started by adding your first token"
          : viewMode === 'saved'
          ? "Start saving tokens to track them here"
          : "Try adjusting your search or filters"}
      </p>
      {(viewMode === 'my-tokens' || viewMode === 'all') && (
        isSignedIn ? (
          <button
            onClick={() => setShowAddToken(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Token
          </button>
        ) : (
          <SignInButton mode="modal">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <User className="w-5 h-5 mr-2" />
              Sign in to Add Token
            </button>
          </SignInButton>
        )
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0A0F1F] pt-24">
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
      <div className="min-h-screen bg-white dark:bg-[#0A0F1F] pt-24">
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

  if (!isLoading && (!tokens || tokens.length === 0)) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0A0F1F] pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0F1F] pt-24 pb-16">
      {/* Show error message if exists */}
      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header Section - All elements in one line */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-8">
          {/* Title */}
          <div className="flex-shrink-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track and manage your tokens</p>
          </div>

          {/* Search and View Mode Controls */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:ml-8">
            {/* Search Bar */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search tokens by name or symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-[#03E1FF]/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#03E1FF]/50 transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* View Mode Selector */}
            <div className="flex bg-gray-100 dark:bg-white/5 rounded-lg p-1 shadow-inner">
              {viewModes.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setViewMode(mode.value)}
                  className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    viewMode === mode.value
                      ? 'bg-white dark:bg-[#03E1FF]/20 text-[#03E1FF] shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 mb-12">
          {/* Trending Tokens Section */}
          <div className="lg:col-span-3 lg:sticky lg:top-24">
            <div className="overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0">
              <div className="min-w-[min-content] lg:min-w-0">
                <TrendingTokens />
              </div>
            </div>
          </div>

          {/* Token Grid */}
          <div className="lg:col-span-9">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-fr">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-100 dark:bg-white/5 rounded-xl h-[280px] backdrop-blur-xl border border-gray-200 dark:border-[#03E1FF]/10 transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg dark:hover:shadow-[#03E1FF]/10"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-fr">
                  {/* Add Token Card */}
                  <div className={`group relative flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br ${
                    isSignedIn 
                      ? 'from-gray-50 to-white dark:from-[#03E1FF]/5 dark:to-[#00FFA3]/5 hover:border-[#03E1FF] dark:hover:border-[#03E1FF]/40 hover:shadow-lg dark:hover:shadow-[#03E1FF]/10'
                      : 'from-gray-100 to-gray-50 dark:from-gray-800/50 dark:to-gray-900/50 cursor-pointer'
                  } rounded-xl border-2 border-dashed border-gray-300 dark:border-[#03E1FF]/20 transition-all duration-300 h-full min-h-[280px]`}>
                    {isSignedIn ? (
                      <Link
                        href="#"
                        onClick={handleAddTokenClick}
                        className="w-full h-full flex flex-col items-center justify-center"
                      >
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 dark:bg-[#03E1FF]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-[#03E1FF]" />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">Add Token</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                          Add your token to start tracking its performance
                        </p>
                      </Link>
                    ) : (
                      <SignInButton mode="modal">
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 dark:bg-[#03E1FF]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-[#03E1FF]" />
                          </div>
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">Sign In to Add Token</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            Sign in to add and track your tokens
                          </p>
                        </div>
                      </SignInButton>
                    )}
                  </div>

                  {/* Token Cards */}
                  {filteredTokens.map((token) => (
                    <div 
                      key={token.contractAddress} 
                      className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:hover:shadow-[#03E1FF]/10"
                    >
                      <TokenCard
                        token={token}
                        onDelete={handleDeleteToken}
                        showDeleteButton={viewMode === 'my-tokens'}
                      />
                    </div>
                  ))}
                </div>

                {/* Empty State */}
                {filteredTokens.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-[#03E1FF]/20">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-[#00FFA3]/10 via-[#03E1FF]/10 to-[#DC1FFF]/10 flex items-center justify-center mb-4 sm:mb-6">
                      {viewMode === 'my-tokens' ? (
                        <Inbox className="w-8 h-8 sm:w-10 sm:h-10 text-[#03E1FF]" />
                      ) : viewMode === 'saved' ? (
                        <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-[#03E1FF]" />
                      ) : (
                        <Search className="w-8 h-8 sm:w-10 sm:h-10 text-[#03E1FF]" />
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
                      {viewMode === 'my-tokens' 
                        ? 'No Tokens Added Yet' 
                        : viewMode === 'saved'
                        ? 'No Saved Tokens'
                        : 'No Results Found'}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                      {viewMode === 'my-tokens'
                        ? 'Start by adding your first token. You can track and manage all your tokens from here.'
                        : viewMode === 'saved'
                        ? 'You haven\'t saved any tokens yet. Save tokens to track them in your dashboard.'
                        : `No tokens found matching "${searchQuery}"`}
                    </p>
                    {viewMode === 'my-tokens' && isSignedIn && (
                      <button
                        onClick={() => setShowAddToken(true)}
                        className="px-6 py-3 bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity duration-300 hover:shadow-lg"
                      >
                        Add Your First Token
                      </button>
                    )}
                  </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8 space-x-2">
                    <button
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}

                {/* Success Message */}
                {successMessage && (
                  <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{successMessage}</span>
                  </div>
                )}

              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showAddToken}
        onClose={() => setShowAddToken(false)}
        title="Add New Token"
        size="md"
      >
        <AddTokenForm onSuccess={() => {
          setShowAddToken(false);
          fetchTokens(); // Refresh the tokens list after adding
        }} />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showConfirmDialog}
        onClose={handleCancelDelete}
        title="Delete Token"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this token? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancelDelete}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              onClick={() => tokenToDelete && handleDeleteToken(tokenToDelete)}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-300"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 