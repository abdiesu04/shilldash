import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/utils/mongodb';
import { Token } from '@/models';
import { fetchTokenData } from '@/utils/solanaTokenUtils';

export async function POST(request: Request) {
  try {
    console.log('Starting token addition process...');
    
    const { userId } = await auth();
    if (!userId) {
      console.log('Unauthorized: No user ID found');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { contractAddress, description } = await request.json();
    console.log('Contract address received:', contractAddress);

    // Fetch token info using our solanaTokenUtils
    console.log('Fetching token info...');
    const tokenData = await fetchTokenData(contractAddress);
    console.log('Token info received:', tokenData);

    // Connect to database
    console.log('Using cached database connection');
    await connectToDatabase();

    // Check if token already exists for this user
    const existingToken = await Token.findOne({
      contractAddress,
      clerkUserId: userId
    });

    const tokenInfo = {
      name: tokenData.name,
      symbol: tokenData.symbol,
      logo: tokenData.logo,
      price: Number(tokenData.price),
      metadata: {
        market_cap: Number(tokenData.metadata.market_cap) || 0,
        volume_24h: Number(tokenData.metadata.volume_24h.h24) || 0,
        price_change_24h: Number(tokenData.metadata.price_change_24h.h24) || 0,
        liquidity: Number(tokenData.metadata.liquidity) || 0,
      },
      onChainData: tokenData.onChainData,
      description: description || '',
      urls: tokenData.urls,
      lastUpdated: new Date()
    };

    if (existingToken) {
      // Update existing token
      console.log('Updating existing token...');
      Object.assign(existingToken, tokenInfo);
      await existingToken.save();
      return NextResponse.json({ 
        message: 'Token updated successfully',
        token: existingToken
      });
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
    let errorMessage = 'Unknown error occurred';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({
      message: 'Error adding token',
      error: errorMessage,
      status: statusCode
    }, { status: statusCode });
  }
} 