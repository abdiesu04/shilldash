import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { Token } from '@/models';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const viewMode = searchParams.get('view') || 'all';
    const skip = (page - 1) * limit;
    const { userId } = await auth();

    await connectToDatabase();

    let query = {};
    let sortOptions = {};

    // If viewing user's tokens, add the userId filter
    if (viewMode === 'my-tokens') {
      if (!userId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      query = { clerkUserId: userId };
    }

    // Sort by price change for trending view
    if (viewMode === 'trending' || viewMode === 'all') {
      sortOptions = { 'metadata.price_change_24h': -1 }; // -1 for descending order
    } else {
      sortOptions = { timestamp: -1 };
    }

    const tokens = await Token.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await Token.countDocuments(query);

    return NextResponse.json({
      tokens,
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