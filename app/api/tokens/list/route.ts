import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { Token, User } from '@/models';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const viewMode = searchParams.get('view') || 'all';
    const skip = (page - 1) * limit;

    const session = await auth();
    const userId = session.userId;
    if ((viewMode === 'my-tokens' || viewMode === 'saved') && !userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    let query = {};
    let sortOptions = {};
    let tokens = [];
    let total = 0;

    if (viewMode === 'saved' && userId) {
      // Get user's saved tokens
      const user = await User.findOne({ clerkUserId: userId });
      if (!user || !user.savedTokens || user.savedTokens.length === 0) {
        return NextResponse.json({
          tokens: [],
          totalPages: 0,
          currentPage: 1,
          total: 0,
          message: 'no_saved_tokens'
        });
      }

      // Find all tokens that are in the user's savedTokens array
      tokens = await Token.find({
        contractAddress: { $in: user.savedTokens }
      })
        .sort({ 'metadata.market_cap': -1 })
        .skip(skip)
        .limit(limit);

      total = await Token.countDocuments({
        contractAddress: { $in: user.savedTokens }
      });

    } else if (viewMode === 'my-tokens' && userId) {
      query = { clerkUserId: userId };
      sortOptions = { lastUpdated: -1 };
      
      tokens = await Token.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);

      total = await Token.countDocuments(query);

      if (tokens.length === 0) {
        return NextResponse.json({
          tokens: [],
          totalPages: 0,
          currentPage: 1,
          total: 0,
          message: 'no_tokens_created'
        });
      }
    } else {
      // For all tokens view, sort by market cap
      sortOptions = { 'metadata.market_cap': -1 };
      tokens = await Token.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);
      
      total = await Token.countDocuments(query);
    }

    // If user is authenticated, check which tokens are saved
    let userSavedTokens: string[] = [];
    if (userId) {
      const user = await User.findOne({ clerkUserId: userId });
      userSavedTokens = user?.savedTokens || [];
    }

    // Transform tokens to add isSaved flag
    const transformedTokens = tokens.map(token => {
      const tokenObj = token.toObject();
      return {
        ...tokenObj,
        isSaved: userSavedTokens.includes(tokenObj.contractAddress),
        metadata: {
          ...tokenObj.metadata,
          isCreator: tokenObj.clerkUserId === userId
        }
      };
    });

    return NextResponse.json({
      tokens: transformedTokens,
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