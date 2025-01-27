import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/utils/mongodb';
import { Token } from '@/models';
import axios from 'axios';

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;

async function getTokenInfo(contractAddress: string) {
  try {
    // Get price and market data
    const priceResponse = await axios.get(
      `https://api.coingecko.com/api/v3/simple/token_price/solana`,
      {
        params: {
          contract_addresses: contractAddress,
          vs_currencies: 'usd',
          include_24hr_vol: true,
          include_24hr_change: true,
          include_market_cap: true
        },
        headers: {
          'x-cg-demo-api-key': COINGECKO_API_KEY
        }
      }
    );

    const tokenData = priceResponse.data[contractAddress];
    if (!tokenData) {
      throw new Error('Token not found');
    }

    // Get additional token info
    const infoResponse = await axios.get(
      `https://api.coingecko.com/api/v3/coins/solana/contract/${contractAddress}`,
      {
        headers: {
          'x-cg-demo-api-key': COINGECKO_API_KEY
        }
      }
    );

    return {
      name: infoResponse.data.name,
      symbol: infoResponse.data.symbol.toUpperCase(),
      logo: infoResponse.data.image?.large,
      price: tokenData.usd,
      metadata: {
        market_cap: tokenData.usd_market_cap,
        volume_24h: tokenData.usd_24h_vol,
        price_change_24h: tokenData.usd_24h_change
      }
    };
  } catch (error) {
    console.error('Error fetching token info:', error);
    throw new Error('Failed to fetch token information');
  }
}

export async function POST(request: Request) {
  try {
    console.log('Starting token addition process...');
    
    const { userId } = await auth();
    if (!userId) {
      console.log('Unauthorized: No user ID found');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { contractAddress } = await request.json();
    console.log('Contract address received:', contractAddress);

    // Fetch token info
    console.log('Fetching token info...');
    const tokenInfo = await getTokenInfo(contractAddress);
    console.log('Token info received:', tokenInfo);

    // Connect to database
    console.log('Using cached database connection');
    await connectToDatabase();

    // Check if token already exists for this user
    const existingToken = await Token.findOne({
      contractAddress,
      clerkUserId: userId
    });

    if (existingToken) {
      // Update existing token
      console.log('Updating existing token...');
      Object.assign(existingToken, {
        ...tokenInfo,
        lastUpdated: new Date()
      });
      await existingToken.save();
      return NextResponse.json({ message: 'Token updated successfully' });
    }

    // Create new token
    console.log('Creating new token...');
    const token = new Token({
      ...tokenInfo,
      contractAddress,
      clerkUserId: userId,
    });

    await token.save();
    return NextResponse.json({
      message: 'Token added successfully',
      token
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding token:', error);
    return NextResponse.json({
      message: 'Error adding token',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 