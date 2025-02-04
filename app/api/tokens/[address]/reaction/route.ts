import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/utils/mongodb';
import { Reaction } from '@/models';

interface PageParams {
  params: Promise<{ address: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: PageParams
) {
  const { address: tokenAddress } = await params;
  
  try {
    const { userId } = await auth();
    await connectToDatabase();

    // Get all reactions for this token
    const reactions = await Reaction.aggregate([
      { $match: { tokenAddress } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format reaction counts
    const reactionCounts = {
      rocket: 0,
      poop: 0
    };
    reactions.forEach((reaction: { _id: 'rocket' | 'poop'; count: number }) => {
      reactionCounts[reaction._id] = reaction.count;
    });

    // Get user's reaction if they're logged in
    let userReaction = null;
    if (userId) {
      const userReactionDoc = await Reaction.findOne({
        tokenAddress,
        userId
      });
      userReaction = userReactionDoc?.type || null;
    }

    return NextResponse.json({ reactions: reactionCounts, userReaction });
  } catch (error) {
    console.error('Error in GET /api/tokens/[address]/reaction:', error);
    return NextResponse.json(
      { message: 'Failed to fetch reactions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: PageParams
) {
  const { address: tokenAddress } = await params;
  
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { reactionType } = await request.json();

    if (!['rocket', 'poop'].includes(reactionType)) {
      return NextResponse.json(
        { message: 'Invalid reaction type' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already reacted
    const existingReaction = await Reaction.findOne({
      tokenAddress,
      userId
    });

    if (existingReaction) {
      if (existingReaction.type === reactionType) {
        // Remove reaction if same type
        await Reaction.deleteOne({ _id: existingReaction._id });
      } else {
        // Update reaction if different type
        existingReaction.type = reactionType;
        await existingReaction.save();
      }
    } else {
      // Create new reaction
      await Reaction.create({
        tokenAddress,
        userId,
        type: reactionType
      });
    }

    // Get updated reaction counts
    const reactions = await Reaction.aggregate([
      { $match: { tokenAddress } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const reactionCounts = {
      rocket: 0,
      poop: 0
    };
    reactions.forEach((reaction: { _id: 'rocket' | 'poop'; count: number }) => {
      reactionCounts[reaction._id] = reaction.count;
    });

    // Get user's current reaction
    const userReaction = await Reaction.findOne({
      tokenAddress,
      userId
    });

    return NextResponse.json({
      reactions: reactionCounts,
      userReaction: userReaction?.type || null
    });
  } catch (error) {
    console.error('Error in POST /api/tokens/[address]/reaction:', error);
    return NextResponse.json(
      { message: 'Failed to handle reaction' },
      { status: 500 }
    );
  }
} 