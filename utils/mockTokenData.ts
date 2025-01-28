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
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
    name: 'USD Coin',
    symbol: 'USDC',
    logo: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
    price: 1.0,
    metadata: {
      market_cap: 45000000000,
      volume_24h: 2500000000,
      price_change_24h: 0.01
    }
  },
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': {
    name: 'Bonk',
    symbol: 'BONK',
    logo: 'https://assets.coingecko.com/coins/images/28600/large/bonk.jpg',
    price: 0.000016,
    metadata: {
      market_cap: 950000000,
      volume_24h: 150000000,
      price_change_24h: 5.23
    }
  },
  '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': {
    name: 'Raydium',
    symbol: 'RAY',
    logo: 'https://assets.coingecko.com/coins/images/13928/large/PSigc4ie_400x400.jpg',
    price: 1.23,
    metadata: {
      market_cap: 350000000,
      volume_24h: 45000000,
      price_change_24h: -2.5
    }
  },
  'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt': {
    name: 'Serum',
    symbol: 'SRM',
    logo: 'https://assets.coingecko.com/coins/images/11970/large/serum-logo.png',
    price: 0.45,
    metadata: {
      market_cap: 225000000,
      volume_24h: 35000000,
      price_change_24h: -1.8
    }
  },
  'ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx': {
    name: 'Star Atlas',
    symbol: 'ATLAS',
    logo: 'https://assets.coingecko.com/coins/images/17659/large/Icon_Reverse.png',
    price: 0.02,
    metadata: {
      market_cap: 75000000,
      volume_24h: 15000000,
      price_change_24h: 3.4
    }
  }
}; 