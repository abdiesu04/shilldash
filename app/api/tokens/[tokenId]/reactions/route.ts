import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import Token from '@/models/Token';
import { connectToDatabase } from '@/utils/database';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { tokenId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    await connectToDatabase();
    const token = await Token.findOne({ contractAddress: params.tokenId });
    
    if (!token) {
      return new Response('Token not found', { status: 404 });
    }

    // Return current reaction counts
    return NextResponse.json({
      reactionCounts: token.reactionCounts
    });
  } catch (error) {
    console.error('Error getting reactions:', error);
    return new Response('Server error', { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { tokenId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { type } = await req.json();
    if (!type || !['fire', 'poop', 'rocket'].includes(type)) {
      return new Response('Invalid reaction type', { status: 400 });
    }

    await connectToDatabase();
    const token = await Token.findOne({ contractAddress: params.tokenId });
    
    if (!token) {
      return new Response('Token not found', { status: 404 });
    }

    // Remove existing reaction if any
    const existingReactionIndex = token.reactions.findIndex(
      (r: any) => r.userId === userId
    );

    if (existingReactionIndex !== -1) {
      const oldType = token.reactions[existingReactionIndex].type;
      token.reactionCounts[oldType] -= 1;
      token.reactions.splice(existingReactionIndex, 1);
    }

    // Add new reaction
    token.reactions.push({
      userId,
      type,
      createdAt: new Date()
    });
    token.reactionCounts[type] += 1;

    await token.save();

    return NextResponse.json({
      message: 'Reaction updated successfully',
      reactionCounts: token.reactionCounts
    });
  } catch (error) {
    console.error('Error updating reaction:', error);
    return new Response('Server error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { tokenId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    await connectToDatabase();
    const token = await Token.findOne({ contractAddress: params.tokenId });
    
    if (!token) {
      return new Response('Token not found', { status: 404 });
    }

    // Remove existing reaction if any
    const existingReactionIndex = token.reactions.findIndex(
      (r: any) => r.userId === userId
    );

    if (existingReactionIndex !== -1) {
      const oldType = token.reactions[existingReactionIndex].type;
      token.reactionCounts[oldType] -= 1;
      token.reactions.splice(existingReactionIndex, 1);
      await token.save();
    }

    return NextResponse.json({
      message: 'Reaction removed successfully',
      reactionCounts: token.reactionCounts
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    return new Response('Server error', { status: 500 });
  }
} 