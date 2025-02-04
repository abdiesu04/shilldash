import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { User } from '@/models';
import { auth } from '@clerk/nextjs/server';
import { EmailAddress } from '@clerk/nextjs/server';

export async function POST(
  req: Request,
  { params }: { params: { address: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Try to find the user first
    let dbUser = await User.findOne({ clerkUserId: userId });

    // If user doesn't exist, create them
    if (!dbUser) {
      // Get user data from Clerk
      const clerkUser = await fetch('https://api.clerk.dev/v1/users/' + userId, {
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        }
      }).then(res => res.json());

      const primaryEmail = clerkUser?.email_addresses?.find((email: EmailAddress) => email.id === clerkUser.primary_email_address_id)?.email_address;

      if (!primaryEmail) {
        return NextResponse.json(
          { message: 'User email not found' },
          { status: 400 }
        );
      }

      dbUser = new User({
        clerkUserId: userId,
        email: primaryEmail,
        savedTokens: [],
        addedTokens: []
      });
      await dbUser.save();
    }

    // Add token to user's savedTokens array
    const result = await User.findOneAndUpdate(
      { clerkUserId: userId },
      { $addToSet: { savedTokens: params.address } },
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { message: 'Failed to save token' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Token saved successfully' });
  } catch (error) {
    console.error('Error saving token:', error);
    return NextResponse.json(
      { message: 'Failed to save token' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { address: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Remove token from user's savedTokens array
    const result = await User.findOneAndUpdate(
      { clerkUserId: userId },
      { $pull: { savedTokens: params.address } },
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Token unsaved successfully' });
  } catch (error) {
    console.error('Error unsaving token:', error);
    return NextResponse.json(
      { message: 'Failed to unsave token' },
      { status: 500 }
    );
  }
} 