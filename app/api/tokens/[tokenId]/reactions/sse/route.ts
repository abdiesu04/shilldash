import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import Token from '@/models/Token';
import { connectToDatabase } from '@/utils/database';

export const runtime = 'edge';
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

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Send an initial ping to establish connection
    await writer.write(encoder.encode('data: {"type":"ping"}\n\n'));

    // Set up MongoDB connection and watch for changes
    try {
      await connectToDatabase();
      const token = await Token.findOne({ contractAddress: params.tokenId });
      
      if (!token) {
        await writer.close();
        return new Response('Token not found', { status: 404 });
      }

      // Send initial data
      const initialData = {
        type: 'update',
        reactionCounts: token.reactionCounts
      };
      await writer.write(encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`));

      // Set up change stream
      const changeStream = Token.watch([
        {
          $match: {
            'documentKey._id': token._id,
            $or: [
              { 'updateDescription.updatedFields.reactionCounts': { $exists: true } },
              { 'updateDescription.updatedFields.reactions': { $exists: true } }
            ]
          }
        }
      ], { fullDocument: 'updateLookup' });

      changeStream.on('change', async (change) => {
        if (change.operationType === 'update' && change.fullDocument) {
          const updateData = {
            type: 'update',
            reactionCounts: change.fullDocument.reactionCounts
          };
          await writer.write(encoder.encode(`data: ${JSON.stringify(updateData)}\n\n`));
        }
      });

      // Handle client disconnect
      req.signal.addEventListener('abort', () => {
        changeStream.close();
        writer.close();
      });

      return new Response(stream.readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } catch (error) {
      console.error('Database error:', error);
      await writer.close();
      return new Response('Database error', { status: 500 });
    }
  } catch (error) {
    console.error('Server error:', error);
    return new Response('Server error', { status: 500 });
  }
} 