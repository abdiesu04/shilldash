import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { User } from '@/models';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      savedTokens: user.savedTokens,
      addedTokens: user.addedTokens
    });
  } catch (error) {
    return NextResponse.json({ 
      message: 'Error fetching user tokens',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { tokenAddress, action, remove } = await request.json();

    await connectToDatabase();

    const updateField = action === 'save' ? 'savedTokens' : 'addedTokens';
    const updateOperation = remove ? '$pull' : '$addToSet';

    await User.findOneAndUpdate(
      { clerkUserId: userId },
      { [updateOperation]: { [updateField]: tokenAddress } },
      { upsert: true }
    );

    return NextResponse.json({ message: 'User tokens updated successfully' });
  } catch (error) {
    return NextResponse.json({ 
      message: 'Error updating user tokens',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 