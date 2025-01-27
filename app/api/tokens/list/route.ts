import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { Token } from '@/models';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    await connectToDatabase();

    const tokens = await Token.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Token.countDocuments();

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