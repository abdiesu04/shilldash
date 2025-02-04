'use client';

import { useState } from 'react';
import { Rocket, X } from 'lucide-react';

export default function ComingSoonModal() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden rounded-lg bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] font-medium text-white transition-all duration-300 hover:scale-105 active:scale-100"
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="relative flex items-center space-x-2">
          <span>Connect Wallet</span>
          <Rocket className="w-4 h-4" />
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
              <div className="w-16 h-16 mb-4 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] rounded-full animate-spin-slow opacity-20" />
                <div className="absolute inset-1 bg-white dark:bg-[#0A0F1F] rounded-full flex items-center justify-center">
                  <Rocket className="w-8 h-8 text-[#03E1FF]" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Coming Soon!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                We're working hard to bring you an amazing portfolio experience. Stay tuned for updates!
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-4 mb-6">
              {[
                'Multi-wallet integration',
                'Real-time portfolio tracking',
                'Advanced trading features',
                'NFT portfolio management',
                'DeFi protocol integration'
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 text-gray-600 dark:text-gray-400"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#00FFA3] to-[#03E1FF]" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Newsletter Signup */}
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email for updates"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#03E1FF]/10 focus:outline-none focus:border-[#03E1FF]/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button className="absolute right-2 top-2 px-4 py-1 rounded-md bg-gradient-to-r from-[#00FFA3] to-[#03E1FF] text-white font-medium hover:opacity-90 transition-opacity">
                Notify Me
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 