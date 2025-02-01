import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/utils/mongodb';
import { Reaction } from '@/models';

// Get reaction counts for a token
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenAddress = searchParams.get('tokenAddress');
    const userId = searchParams.get('userId');

    if (!tokenAddress) {
      return NextResponse.json({ message: 'Token address is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Get reaction counts
    const counts = await Reaction.aggregate([
      { $match: { tokenAddress } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Format counts
    const formattedCounts = {
      rocket: 0,
      poop: 0,
      like: 0,
    };
    counts.forEach(({ _id, count }) => {
      formattedCounts[_id] = count;
    });

    // If userId is provided, get user's reaction
    let userReaction = null;
    if (userId) {
      const reaction = await Reaction.findOne({ tokenAddress, clerkUserId: userId });
      if (reaction) {
        userReaction = reaction.type;
      }
    }

    return NextResponse.json({
      counts: formattedCounts,
      userReaction
    });

  } catch (error) {
    console.error('Error getting reactions:', error);
    return NextResponse.json(
      { message: 'Error getting reactions' },
      { status: 500 }
    );
  }
}

// Add or update reaction
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { tokenAddress, type } = await request.json();

    if (!tokenAddress || !type) {
      return NextResponse.json(
        { message: 'Token address and reaction type are required' },
        { status: 400 }
      );
    }

    if (!['rocket', 'poop', 'like'].includes(type)) {
      return NextResponse.json(
        { message: 'Invalid reaction type' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Remove existing reaction if any
    await Reaction.deleteOne({ tokenAddress, clerkUserId: userId });

    // Add new reaction
    const reaction = new Reaction({
      tokenAddress,
      clerkUserId: userId,
      type,
    });

    await reaction.save();

    // Get updated counts
    const counts = await Reaction.aggregate([
      { $match: { tokenAddress } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const formattedCounts = {
      rocket: 0,
      poop: 0,
      like: 0,
    };
    counts.forEach(({ _id, count }) => {
      formattedCounts[_id] = count;
    });

    return NextResponse.json({
      message: 'Reaction added successfully',
      counts: formattedCounts,
      userReaction: type
    });

  } catch (error) {
    console.error('Error adding reaction:', error);
    return NextResponse.json(
      { message: 'Error adding reaction' },
      { status: 500 }
    );
  }
}

// Remove reaction
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tokenAddress = searchParams.get('tokenAddress');

    if (!tokenAddress) {
      return NextResponse.json(
        { message: 'Token address is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    await Reaction.deleteOne({ tokenAddress, clerkUserId: userId });

    // Get updated counts
    const counts = await Reaction.aggregate([
      { $match: { tokenAddress } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const formattedCounts = {
      rocket: 0,
      poop: 0,
      like: 0,
    };
    counts.forEach(({ _id, count }) => {
      formattedCounts[_id] = count;
    });

    return NextResponse.json({
      message: 'Reaction removed successfully',
      counts: formattedCounts,
      userReaction: null
    });

  } catch (error) {
    console.error('Error removing reaction:', error);
    return NextResponse.json(
      { message: 'Error removing reaction' },
      { status: 500 }
    );
  }
} 