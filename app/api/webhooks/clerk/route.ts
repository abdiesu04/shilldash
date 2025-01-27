import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { User } from '@/models';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Connect to database
  await connectToDatabase();

  // Handle the webhook
  const eventType = evt.type;
  console.log(`Processing webhook event: ${eventType}`);

  if (eventType === 'user.created') {
    const { id, email_addresses } = evt.data;
    const primaryEmail = email_addresses[0]?.email_address;

    const user = new User({
      clerkUserId: id,
      email: primaryEmail,
      savedTokens: [],
      addedTokens: []
    });

    await user.save();
    console.log('New user created in MongoDB:', id);
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    await User.findOneAndDelete({ clerkUserId: id });
    console.log('User deleted from MongoDB:', id);
  }

  return NextResponse.json({ success: true });
} 