'use client';

import { Wallet2, ArrowRightLeft, LineChart, Gem, LucideIcon } from 'lucide-react';
import ComingSoonModal from '@/components/portfolio/ComingSoonModal';

interface FeatureCard {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
}

const features: FeatureCard[] = [
  {
    title: 'Connect Wallet',
    description: 'Securely connect your crypto wallets to track your assets in real-time',
    icon: Wallet2,
    gradient: 'from-[#00FFA3] to-[#03E1FF]',
  },
  {
    title: 'Trade Assets',
    description: 'Execute trades across multiple DEXs with the best rates and lowest fees',
    icon: ArrowRightLeft,
    gradient: 'from-[#03E1FF] to-[#DC1FFF]',
  },
  {
    title: 'Track Performance',
    description: 'Monitor your portfolio performance with detailed analytics and insights',
    icon: LineChart,
    gradient: 'from-[#DC1FFF] to-[#00FFA3]',
  },
  {
    title: 'NFT Integration',
    description: 'View and manage your NFT collection alongside your token portfolio',
    icon: Gem,
    gradient: 'from-[#03E1FF] to-[#00FFA3]',
  },
];

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0F1F] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] mb-4">
          Your Crypto Portfolio
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Track, trade, and manage your crypto assets in one powerful dashboard
        </p>
      </div>

      {/* Feature Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group relative p-6 rounded-2xl border border-gray-200 dark:border-[#03E1FF]/10 bg-white dark:bg-[#0A0F1F] hover:border-[#03E1FF]/30 transition-all duration-300"
          >
            {/* Decorative Edges */}
            <div className="absolute -top-px left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#03E1FF]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -left-px top-[10%] bottom-[10%] w-[1px] bg-gradient-to-b from-transparent via-[#03E1FF]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -right-px top-[10%] bottom-[10%] w-[1px] bg-gradient-to-b from-transparent via-[#03E1FF]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -bottom-px left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#03E1FF]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.gradient} bg-opacity-10 dark:bg-opacity-5`}>
                <feature.icon className="w-6 h-6 text-gray-900 dark:text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto text-center">
        <ComingSoonModal />
      </div>
    </div>
  );
}
