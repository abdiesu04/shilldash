import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { User } from '@/models';

export async function GET(request: Request) {
  try {
    // Get API key from header
    const apiKey = request.headers.get('x-api-key');
    const API_KEY = process.env.PUBLIC_API_KEY;

    // Basic API key validation
    if (!apiKey || apiKey !== API_KEY) {
      return NextResponse.json({ 
        error: 'Unauthorized - Invalid or missing API key' 
      }, { status: 401 });
    }

    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get users with pagination
    const users = await User.find({}, {
      _id: 0, // Exclude MongoDB _id
      clerkUserId: 1,
      email: 1,
      walletAddress: 1,
      createdAt: 1,
      savedTokens: 1,
      addedTokens: 1
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    // Get total count
    const total = await User.countDocuments();

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch users'
    }, { status: 500 });
  }
} 