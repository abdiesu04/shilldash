export default function TrendingTokens() {
  // ... existing state and hooks ...

  return (
    <div className="bg-gradient-to-br from-[#0A0F1F] to-[#151933] rounded-xl border border-[#03E1FF]/20 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#03E1FF]" />
          <h2 className="text-base font-semibold text-white">Trending Tokens</h2>
        </div>
        <button
          onClick={() => setTimeframe(timeframe === '24h' ? '7d' : '24h')}
          className="px-2 py-1 text-xs font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300"
        >
          {timeframe === '24h' ? '24H' : '7D'}
        </button>
      </div>

      <div className="space-y-3">
        {tokens.map((token, index) => (
          <div
            key={token.id}
            className="group flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer"
            onClick={() => handleTokenClick(token)}
          >
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 flex items-center justify-center text-xs font-medium text-gray-400 group-hover:text-[#03E1FF]">
                {index + 1}
              </div>
              <div className="relative">
                <Image
                  src={token.logo}
                  alt={`${token.name} logo`}
                  width={28}
                  height={28}
                  className="rounded-full ring-2 ring-[#03E1FF]/20 group-hover:ring-[#03E1FF]/40 transition-all duration-300"
                />
                {token.metadata.price_change_24h > 5 && (
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="w-2.5 h-2.5 text-[#00FFA3] animate-pulse" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-white group-hover:text-[#03E1FF] transition-colors duration-300">
                  {token.name}
                </h3>
                <p className="text-[10px] text-gray-400">
                  {token.symbol}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-white group-hover:text-[#03E1FF] transition-colors duration-300">
                ${token.price < 0.01 ? token.price.toFixed(8) : token.price.toFixed(2)}
              </p>
              <div className={`flex items-center justify-end space-x-1 text-[10px] ${
                token.metadata.price_change_24h >= 0
                  ? 'text-[#00FFA3]'
                  : 'text-red-500'
              }`}>
                {token.metadata.price_change_24h >= 0 ? (
                  <TrendingUp className="w-2.5 h-2.5" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5" />
                )}
                <span>{Math.abs(token.metadata.price_change_24h).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Token Details Modal */}
      <Modal
        isOpen={!!selectedToken}
        onClose={() => setSelectedToken(null)}
        title={selectedToken ? `${selectedToken.name} (${selectedToken.symbol})` : ''}
        size="lg"
      >
        {selectedToken && <TokenDetails token={selectedToken} />}
      </Modal>
    </div>
  );
} 