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

    console.log('Getting reactions for token:', tokenAddress);

    // Get reaction counts with proper type casting
    const counts = await Reaction.aggregate([
      { 
        $match: { 
          tokenAddress,
          reactionType: { $in: ['rocket', 'poop', 'like'] }
        } 
      },
      { 
        $group: { 
          _id: '$reactionType', 
          count: { $sum: 1 } 
        } 
      }
    ]);

    console.log('Raw counts:', counts);

    // Initialize counts with zeros
    const formattedCounts = {
      rocket: 0,
      poop: 0,
      like: 0,
    };

    // Update counts from aggregation
    counts.forEach(({ _id, count }) => {
      if (_id in formattedCounts) {
        formattedCounts[_id] = count;
      }
    });

    console.log('Formatted counts:', formattedCounts);

    // If userId is provided, get user's reaction
    let userReaction = null;
    if (userId) {
      const reaction = await Reaction.findOne({ 
        tokenAddress, 
        clerkUserId: userId,
        reactionType: { $in: ['rocket', 'poop', 'like'] }
      });
      if (reaction) {
        userReaction = reaction.reactionType;
      }
    }

    console.log('Final response:', { counts: formattedCounts, userReaction });

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
    console.log('Adding/updating reaction:', { tokenAddress, type, userId });

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

    // First try to find an existing reaction
    const existingReaction = await Reaction.findOne({
      tokenAddress,
      clerkUserId: userId
    });

    console.log('Existing reaction:', existingReaction);

    if (existingReaction) {
      // If the same reaction type, remove it (toggle off)
      if (existingReaction.reactionType === type) {
        await existingReaction.deleteOne();
        console.log('Removed existing reaction');
      } else {
        // If different reaction type, update it
        existingReaction.reactionType = type;
        await existingReaction.save();
        console.log('Updated reaction type');
      }
    } else {
      // Create new reaction
      const reaction = new Reaction({
        tokenAddress,
        clerkUserId: userId,
        reactionType: type
      });
      await reaction.save();
      console.log('Created new reaction');
    }

    // Get updated counts with proper type filtering
    const counts = await Reaction.aggregate([
      { 
        $match: { 
          tokenAddress,
          reactionType: { $in: ['rocket', 'poop', 'like'] }
        } 
      },
      { 
        $group: { 
          _id: '$reactionType', 
          count: { $sum: 1 } 
        } 
      }
    ]);

    console.log('Updated counts:', counts);

    const formattedCounts = {
      rocket: 0,
      poop: 0,
      like: 0,
    };

    counts.forEach(({ _id, count }) => {
      if (_id in formattedCounts) {
        formattedCounts[_id] = count;
      }
    });

    // Get the user's current reaction after update
    const currentReaction = await Reaction.findOne({
      tokenAddress,
      clerkUserId: userId,
      reactionType: { $in: ['rocket', 'poop', 'like'] }
    });

    const response = {
      message: 'Reaction updated successfully',
      counts: formattedCounts,
      userReaction: currentReaction?.reactionType || null
    };

    console.log('Final response:', response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error updating reaction:', error);
    return NextResponse.json(
      { message: 'Error updating reaction' },
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
      { $group: { _id: '$reactionType', count: { $sum: 1 } } }
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