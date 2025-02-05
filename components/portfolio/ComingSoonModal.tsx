'use client';

import { useState } from 'react';
import { Wallet2, X, AlertCircle } from 'lucide-react';

export default function ComingSoonModal() {
  const [showModal, setShowModal] = useState(false);
  const [showError, setShowError] = useState(false);

  const walletOptions = [
    {
      name: 'MetaMask',
      icon: '/assets/metamask.svg',
    },
    {
      name: 'WalletConnect', 
      icon: '/assets/walletconnect.svg',
    },
    {
      name: 'Coinbase Wallet',
      icon: '/assets/coinbase.svg',
    },
    {
      name: 'Trust Wallet',
      icon: '/assets/trustwallet.svg',
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
            <div className="flex flex-col items-center text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Connect Your Wallet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose your preferred wallet connection method
              </p>
            </div>

            {/* Wallet Options */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {walletOptions.map((wallet) => (
                <button
                  key={wallet.name}
                  onClick={() => handleWalletSelect()}
                  className="p-4 rounded-lg border border-gray-200 dark:border-[#03E1FF]/10 hover:border-[#03E1FF]/30 transition-all duration-300 flex flex-col items-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                    <Wallet2 className="w-6 h-6 text-[#03E1FF]" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {wallet.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Error Alert */}
            {showError && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Connection Failed
                  </h4>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                    Please try again
                  </p>
                </div>
              </div>
            )}

            
          </div>
        </div>
      )}
    </>
  );
}