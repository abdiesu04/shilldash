'use client';

import { useEffect, useState } from 'react';
import TokenCard from '@/components/tokens/TokenCard';
import EmptyTokenGrid from '@/components/tokens/EmptyTokenGrid';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, User, Crown, AlertTriangle, CheckCircle2 } from 'lucide-react';

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
    <div className="min-h-screen bg-[#0A0F1F] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-24 right-4 flex items-center bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-2 rounded-lg shadow-lg z-50">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            {successMessage}
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#0A0F1F] border border-gray-800 rounded-lg p-6 max-w-md w-full mx-4 mt-16">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-500 mr-2" />
                <h3 className="text-lg font-medium text-white">Confirm Deletion</h3>
              </div>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete this token? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => tokenToDelete && handleDeleteToken(tokenToDelete)}
                  className="group relative flex items-center px-4 py-2 text-sm font-medium text-white overflow-hidden rounded-lg transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-red-500/20 group-hover:bg-red-500/30 transition-colors duration-300" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] bg-clip-text text-transparent">
              {viewMode === 'my-tokens' 
                ? 'Created Tokens' 
                : viewMode === 'saved' 
                ? 'Saved Tokens' 
                : 'Token Dashboard'}
            </h1>
            {viewMode === 'my-tokens' && (
              <p className="text-gray-400 mt-1">
                Manage and track tokens you've created
              </p>
            )}
          </div>
          {userId && (
            <Link
              href="/add-token"
              className="group relative flex items-center px-4 py-2 text-sm font-medium text-white overflow-hidden rounded-lg transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] opacity-100 group-hover:opacity-90 transition-opacity duration-300" />
              <div className="absolute inset-[1px] bg-[#0A0F1F] rounded-lg group-hover:bg-transparent transition-all duration-300" />
              <Plus className="w-4 h-4 mr-2 relative z-10" />
              <span className="relative z-10">Create Token</span>
            </Link>
          )}
        </div>

        {displayTokens.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTokens.map((token) => (
              <TokenCard
                key={token.contractAddress}
                token={token}
                onDelete={() => handleDeleteClick(token.contractAddress)}
                showDeleteButton={token.clerkUserId === userId}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="group relative px-4 py-2 text-sm font-medium text-white overflow-hidden rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00FFA3]/10 via-[#03E1FF]/10 to-[#DC1FFF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-[#03E1FF]">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="group relative px-4 py-2 text-sm font-medium text-white overflow-hidden rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00FFA3]/10 via-[#03E1FF]/10 to-[#DC1FFF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 