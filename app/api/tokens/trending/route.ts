import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { Token } from '@/models';

export async function GET() {
  try {
    await connectToDatabase();

    // Get tokens sorted by 24h volume and positive price change
    const tokens = await Token.find({
      'metadata.volume_24h': { $gt: 0 },
      'metadata.price_change_24h': { $exists: true }
    })
    .sort({
      'metadata.volume_24h': -1,
      'metadata.price_change_24h': -1
    })
    .limit(10);

    return NextResponse.json({
      tokens
    });
  } catch (error) {
    console.error('Error fetching trending tokens:', error);
    return NextResponse.json(
      { message: 'Error fetching trending tokens' },
      { status: 500 }
    );
  }
} 