interface MockTokenData {
  [key: string]: {
    name: string;
    symbol: string;
    logo: string;
    price: number;
    metadata: {
      market_cap: number;
      volume_24h: number;
      price_change_24h: number;
    };
  };
}

export const mockTokenData: MockTokenData = {
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': {
    name: 'Uniswap',
    symbol: 'UNI',
    logo: 'https://assets.coingecko.com/coins/images/12504/large/uni.jpg',
    price: 7.23,
    metadata: {
      market_cap: 4500000000,
      volume_24h: 250000000,
      price_change_24h: 15.5,
    },
  },
  '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0': {
    name: 'Polygon',
    symbol: 'MATIC',
    logo: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
    price: 0.85,
    metadata: {
      market_cap: 9500000000,
      volume_24h: 150000000,
      price_change_24h: 8.23,
    },
  },
  '0x514910771af9ca656af840dff83e8264ecf986ca': {
    name: 'Chainlink',
    symbol: 'LINK',
    logo: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
    price: 14.23,
    metadata: {
      market_cap: 3500000000,
      volume_24h: 450000000,
      price_change_24h: -2.5,
    },
  },
  '0x6b175474e89094c44da98b954eedeac495271d0f': {
    name: 'Dai',
    symbol: 'DAI',
    logo: 'https://assets.coingecko.com/coins/images/9956/large/Badge_Dai.png',
    price: 1.0,
    metadata: {
      market_cap: 2250000000,
      volume_24h: 350000000,
      price_change_24h: 0.01,
    },
  },
  '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce': {
    name: 'Shiba Inu',
    symbol: 'SHIB',
    logo: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png',
    price: 0.00002,
    metadata: {
      market_cap: 7500000000,
      volume_24h: 150000000,
      price_change_24h: 25.4,
    },
  },
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': {
    name: 'Wrapped Bitcoin',
    symbol: 'WBTC',
    logo: 'https://assets.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png',
    price: 43245.45,
    metadata: {
      market_cap: 7300000000,
      volume_24h: 1200000000,
      price_change_24h: 5.25,
    },
  },
  '0x4d224452801aced8b2f0aebe155379bb5d594381': {
    name: 'ApeCoin',
    symbol: 'APE',
    logo: 'https://assets.coingecko.com/coins/images/24383/large/apecoin.jpg',
    price: 1.23,
    metadata: {
      market_cap: 2000000000,
      volume_24h: 300000000,
      price_change_24h: -12.35,
    },
  },
  '0x75231f58b43240c9718dd58b4967c5114342a86c': {
    name: 'OKB',
    symbol: 'OKB',
    logo: 'https://assets.coingecko.com/coins/images/4463/large/WeChat_Image_20220118095654.png',
    price: 45.15,
    metadata: {
      market_cap: 3200000000,
      volume_24h: 250000000,
      price_change_24h: 18.65,
    },
  },
  '0x4e15361fd6b4bb609fa63c81a2be19d873717870': {
    name: 'Fantom',
    symbol: 'FTM',
    logo: 'https://assets.coingecko.com/coins/images/4001/large/Fantom_round.png',
    price: 0.76,
    metadata: {
      market_cap: 1200000000,
      volume_24h: 900000000,
      price_change_24h: -8.2,
    },
  }
}; 