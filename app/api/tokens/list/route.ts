import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { Token } from '@/models';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const viewMode = searchParams.get('view') || 'all';
    const userId = searchParams.get('userId');
    const skip = (page - 1) * limit;

    console.log('Fetching tokens with params:', { page, limit, viewMode, userId });

    await connectToDatabase();

    let query = {};
    let sortOptions = {};

    // If viewing user's tokens, only show tokens created by the user
    if (viewMode === 'my-tokens' && userId) {
      query = { 
        clerkUserId: userId,
        'metadata.isCreator': true  // Add this to ensure we only get tokens where user is creator
      };
      console.log('My tokens query:', query);
      sortOptions = { lastUpdated: -1 }; // Sort by last updated for user's tokens
    } else if (viewMode === 'trending') {
      // For trending view, filter tokens with positive price change and high volume
      query = {
        'metadata.volume_24h': { $gt: 0 },
        'metadata.price_change_24h': { $gt: 0 }
      };
      sortOptions = { 
        'metadata.volume_24h': -1,
        'metadata.price_change_24h': -1 
      };
    } else {
      // For all tokens view, sort by market cap
      sortOptions = { 'metadata.market_cap': -1 };
    }

    console.log('Executing query:', query);
    const tokens = await Token.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    // Add isCreator flag to each token
    const tokensWithCreatorFlag = tokens.map(token => ({
      ...token.toObject(),
      metadata: {
        ...token.metadata,
        isCreator: token.clerkUserId === userId
      }
    }));

    console.log(`Found ${tokens.length} tokens`);

    const total = await Token.countDocuments(query);

    return NextResponse.json({
      tokens: tokensWithCreatorFlag,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json({
      message: 'Error fetching tokens',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 