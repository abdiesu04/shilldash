import axios from 'axios';

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;

export const coinGeckoApi = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3',
  headers: {
    'x-cg-demo-api-key': COINGECKO_API_KEY
  }
});

export async function getTokenMetadata(contractAddress: string) {
  try {
    const response = await coinGeckoApi.get(`/simple/token_price/solana`, {
      params: {
        contract_addresses: contractAddress,
        vs_currencies: 'usd',
        include_24hr_vol: true,
        include_24hr_change: true,
        include_market_cap: true
      }
    });

    const tokenData = response.data[contractAddress];
    if (!tokenData) {
      throw new Error('Token not found');
    }

    // Format the data to match our schema
    return {
      price: tokenData.usd,
      metadata: {
        market_cap: tokenData.usd_market_cap,
        volume_24h: tokenData.usd_24h_vol,
        price_change_24h: tokenData.usd_24h_change
      }
    };
  } catch (error) {
    console.error('CoinGecko API error:', error);
    throw new Error('Failed to fetch token metadata');
  }
}

// Get detailed token data for charts
export async function getTokenDetails(contractAddress: string) {
  try {
    const [priceData, marketData] = await Promise.all([
      coinGeckoApi.get(`/coins/solana/contract/${contractAddress}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: '7'
        }
      }),
      getTokenMetadata(contractAddress)
    ]);

    return {
      ...marketData,
      chart_data: priceData.data
    };
  } catch (error) {
    console.error('Error fetching token details:', error);
    throw new Error('Failed to fetch token details');
  }
} 