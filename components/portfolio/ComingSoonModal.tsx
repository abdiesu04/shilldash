'use client';

import { useState } from 'react';
import { Wallet2, X, AlertCircle } from 'lucide-react';

export default function ComingSoonModal() {
  const [showModal, setShowModal] = useState(false);
  const [showError, setShowError] = useState(false);

  const walletOptions = [
    {
      name: 'Phantom',
      icon: '/phantom.png',
      description: 'Connect using Phantom Wallet',
      color: 'from-purple-500 to-violet-600'
    },
    {
      name: 'Solflare',
      icon: '/solflare.png',
      description: 'Connect using Solflare Wallet',
      color: 'from-orange-500 to-red-600'
    },
    {
      name: 'Backpack',
      icon: '/backpack.png',
      description: 'Connect using Backpack Wallet',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      name: 'OKX',
      icon: '/okx.png',
      description: 'Connect using OKX Wallet',
      color: 'from-green-500 to-emerald-600'
    }
  ];

  const handleWalletSelect = () => {
    setShowError(true);
    setTimeout(() => setShowError(false), 3000);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden rounded-lg bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] font-medium text-white transition-all duration-300 hover:scale-105 active:scale-100"
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="relative flex items-center space-x-2">
          <span>Connect Wallet</span>
          <Wallet2 className="w-4 h-4" />
        </span>
      </button>

      {/* Modal Backdrop */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          {/* Modal Content */}
          <div
            className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-[#0A0F1F] p-6 text-left shadow-xl transition-all"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 mb-4 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] rounded-full animate-spin-slow opacity-20" />
                <div className="absolute inset-1 bg-white dark:bg-[#0A0F1F] rounded-full flex items-center justify-center">
                  <Wallet2 className="w-8 h-8 text-[#03E1FF] animate-pulse" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Connect Your Wallet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                Choose your preferred wallet to connect with ShillDash
              </p>
            </div>

            {/* Wallet Options */}
            <div className="grid grid-cols-1 gap-3 mb-6">
              {walletOptions.map((wallet) => (
                <button
                  key={wallet.name}
                  onClick={handleWalletSelect}
                  className="group relative p-4 rounded-xl border border-gray-200 dark:border-[#03E1FF]/10 hover:border-[#03E1FF]/30 transition-all duration-300 flex items-center space-x-4 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00FFA3]/5 via-[#03E1FF]/5 to-[#DC1FFF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center p-2 ring-1 ring-gray-200/20">
                      <Wallet2 className="w-6 h-6 text-[#03E1FF]" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {wallet.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {wallet.description}
                      </p>
                    </div>
                  </div>
                  <div className="ml-auto relative z-10">
                    <div className="w-8 h-8 rounded-full bg-[#03E1FF]/10 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-[#03E1FF]" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Error Alert */}
            {showError && (
              <div className="animate-fade-in mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Connection Failed
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                      Please try again later.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info Footer */}
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p>Need help? Join our community on <a href="https://t.me/+1tRL0DsuhHtiNDQ0" target="_blank" rel="noopener noreferrer" className="text-[#03E1FF] hover:underline">Telegram</a></p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}