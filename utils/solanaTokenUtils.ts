import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";

// Default placeholder image for invalid or missing logos
const DEFAULT_TOKEN_LOGO = '/placeholder.svg';

// Validate image URL with timeout and multiple retries
async function isValidImageUrl(url: string): Promise<boolean> {
  if (!url) return false;
  
  // Try up to 3 times
  for (let i = 0; i < 3; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const contentType = response.headers.get('content-type');
      if (response.ok && contentType && (
        contentType.startsWith('image/') || 
        url.endsWith('.png') || 
        url.endsWith('.jpg') || 
        url.endsWith('.jpeg') || 
        url.endsWith('.gif') || 
        url.endsWith('.svg')
      )) {
        return true;
      }
    } catch (error) {
      if (i === 2) return false; // Only return false on the last attempt
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
    }
  }
  return false;
}

export function isValidSolanaAddress(address: string): boolean {
  try {
    if (typeof address !== 'string') {
      return false;
    }

    if (address.startsWith('0x')) {
      return false;
    }

    if (address.length !== 44 && address.length !== 43) {
      return false;
    }

    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
}

async function fetchOnChainMetadata(address: string, connection: Connection) {
  try {
    if (!isValidSolanaAddress(address)) {
      throw new Error("Invalid Solana address format");
    }

    const publicKey = new PublicKey(address);
    const accountInfo = await connection.getAccountInfo(publicKey);
    
    if (!accountInfo) {
      throw new Error("Token not found on Solana blockchain");
    }

    const mintInfo = await getMint(connection, publicKey);
    return {
      supply: mintInfo.supply.toString(),
      decimals: mintInfo.decimals,
      mintAuthority: mintInfo.mintAuthority?.toBase58() || null,
      freezeAuthority: mintInfo.freezeAuthority?.toBase58() || null,
      isInitialized: mintInfo.isInitialized
    };
  } catch (error) {
    throw error;
  }
}

async function fetchMarketData(address: string) {
  const headers = {
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0'
  };

  const tokenUrl = `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${address}`;
  const tokenResponse = await fetch(tokenUrl, { headers });
  
  if (!tokenResponse.ok) {
    throw new Error(`GeckoTerminal API error: ${tokenResponse.status}`);
  }

  const tokenData = await tokenResponse.json();
  const token = tokenData.data?.attributes;

  if (!token) {
    throw new Error("Invalid token data received");
  }

  const poolsUrl = `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${address}/pools?page=1&limit=1`;
  const poolsResponse = await fetch(poolsUrl, { headers });
  const poolsData = await poolsResponse.json();
  const pool = poolsData.data?.[0]?.attributes;

  // Validate logo URL with better error handling
  let logoUrl = token.image_url || "";
  try {
    const isValidLogo = await isValidImageUrl(logoUrl);
    if (!isValidLogo) {
      console.warn(`Invalid logo URL for token ${address}: ${logoUrl}`);
      logoUrl = DEFAULT_TOKEN_LOGO;
    }
  } catch (error) {
    console.error(`Error validating logo URL for token ${address}:`, error);
    logoUrl = DEFAULT_TOKEN_LOGO;
  }

  return {
    name: token.name,
    symbol: token.symbol,
    logo: logoUrl,
    price_usd: token.price_usd || 0,
    market_cap_usd: token.market_cap_usd || 0,
    volume_24h: pool?.volume_usd || 0,
    price_change_24h: pool?.price_change_percentage || 0,
    liquidity_usd: pool?.reserve_in_usd || 0
  };
}

async function fetchHistoricalData(address: string) {
  try {
    const headers = {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0'
    };

    const response = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${address}/ohlcv/day`,
      { headers }
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Historical data not available for token:', address);
        return null;
      }
      throw new Error(`Historical data fetch failed: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.data?.attributes?.ohlcv_list) {
      console.warn('Invalid historical data structure for token:', address);
      return null;
    }
    
    return data.data.attributes.ohlcv_list.map((item: any[]) => ({
      timestamp: new Date(item[0]).toISOString(),
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4],
      volume: item[5]
    }));
  } catch (error) {
    console.warn('Error fetching historical data:', error);
    return null;
  }
}

export async function fetchTokenData(address: string) {
  if (!isValidSolanaAddress(address)) {
    throw new Error("Invalid Solana token address format");
  }

  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

  try {
    const [marketData, onChainData] = await Promise.all([
      fetchMarketData(address),
      fetchOnChainMetadata(address, connection)
    ]);

    const historicalData = await fetchHistoricalData(address).catch(() => null);

    const urls = {
      explorers: {
        solscan: `https://solscan.io/token/${address}`,
        solanaFM: `https://solana.fm/address/${address}`,
        explorer: `https://explorer.solana.com/address/${address}`
      },
      trading: {
        raydium: `https://raydium.io/swap/?inputCurrency=sol&outputCurrency=${address}`,
        jupiter: `https://jup.ag/swap/SOL-${address}`,
        orca: `https://www.orca.so/swap?inputMint=So11111111111111111111111111111111111111112&outputMint=${address}`
      }
    };

    return {
      name: marketData.name,
      symbol: marketData.symbol,
      logo: marketData.logo,
      price: marketData.price_usd,
      contractAddress: address,
      metadata: {
        market_cap: marketData.market_cap_usd,
        volume_24h: marketData.volume_24h,
        price_change_24h: marketData.price_change_24h,
        liquidity: marketData.liquidity_usd
      },
      onChainData,
      historicalData,
      urls,
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    throw error;
  }
} 