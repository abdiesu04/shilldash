import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { User, Token } from '@/models';

export async function POST() {
  try {
    console.log('Starting database cleanup...');
    await connectToDatabase();

    // Remove all users
    const userDeleteResult = await User.deleteMany({});
    console.log(`Deleted ${userDeleteResult.deletedCount} users`);

    // Remove all tokens
    const tokenDeleteResult = await Token.deleteMany({});
    console.log(`Deleted ${tokenDeleteResult.deletedCount} tokens`);

    return NextResponse.json({
      success: true,
      message: 'Database cleaned successfully',
      usersDeleted: userDeleteResult.deletedCount,
      tokensDeleted: tokenDeleteResult.deletedCount
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clean database'
    }, { status: 500 });
  }
} 