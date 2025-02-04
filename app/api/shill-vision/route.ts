import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { Token } from '@/models';

export async function GET() {
  try {
    await connectToDatabase();

    // Get recently added tokens (last 3)
    const recentTokens = await Token.find()
      .sort({ lastUpdated: -1 })
      .limit(3);

    // Get tokens about to graduate (market cap between 10M and 100M)
    const aboutToGraduate = await Token.find({
      'metadata.market_cap': {
        $gte: 10_000_000, // 10M
        $lt: 100_000_000, // 100M
      },
    })
      .sort({ 'metadata.market_cap': -1 })
      .limit(3);

    // Get graduated tokens (market cap >= 100M)
    const graduated = await Token.find({
      'metadata.market_cap': {
        $gte: 100_000_000, // 100M
      },
    })
      .sort({ 'metadata.market_cap': -1 })
      .limit(3);

    return NextResponse.json({
      recentTokens,
      aboutToGraduate,
      graduated,
    });
  } catch (error) {
    console.error('Error fetching shill vision data:', error);
    return NextResponse.json(
      { message: 'Error fetching shill vision data' },
      { status: 500 }
    );
  }
} 