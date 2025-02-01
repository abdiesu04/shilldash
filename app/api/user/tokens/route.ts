import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { User } from '@/models';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(request: Request) {
  try {
    const { userId } = getAuth(request);
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
    console.error('Error fetching user tokens:', error);
    return NextResponse.json({ 
      message: 'Error fetching user tokens',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      console.log('Unauthorized: No user ID found');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tokenAddress, action, remove } = body;

    console.log('Token update request:', { userId, tokenAddress, action, remove });

    if (!tokenAddress || !action) {
      console.log('Bad request: Missing required fields');
      return NextResponse.json(
        { message: 'Token address and action are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // First check if the user exists
    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      console.log('User not found:', userId);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const updateField = action === 'save' ? 'savedTokens' : 'addedTokens';
    const updateOperation = remove ? '$pull' : '$addToSet';

    console.log('Updating user tokens:', {
      userId,
      updateField,
      updateOperation,
      tokenAddress
    });

    const result = await User.findOneAndUpdate(
      { clerkUserId: userId },
      { [updateOperation]: { [updateField]: tokenAddress } },
      { new: true }
    );

    if (!result) {
      console.log('Failed to update user tokens');
      return NextResponse.json({ 
        message: 'Failed to update user tokens' 
      }, { status: 500 });
    }

    console.log('User tokens updated successfully:', {
      userId,
      savedTokens: result.savedTokens,
      addedTokens: result.addedTokens
    });

    return NextResponse.json({ 
      message: 'User tokens updated successfully',
      savedTokens: result.savedTokens,
      addedTokens: result.addedTokens
    });
  } catch (error) {
    console.error('Error updating user tokens:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error
    });

    return NextResponse.json({ 
      message: 'Error updating user tokens',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 