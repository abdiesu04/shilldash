{/* Trending Tokens Section */}
<section className="relative">
  <div className="flex flex-col space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Trending Tokens
      </h2>
    </div>
    
    {/* Token Cards Container - Horizontal scroll on mobile */}
    <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
      <div className="flex md:grid md:grid-cols-1 md:gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 md:pb-0 space-x-4 md:space-x-0">
        {tokens.map((token) => (
          <div key={token.contractAddress} className="flex-shrink-0 w-[300px] md:w-auto">
            <TokenCard
              token={token}
              onDelete={handleDeleteToken}
              showDeleteButton={true}
            />
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

<style jsx global>{`
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`}</style> 