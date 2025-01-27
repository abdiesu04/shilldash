import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { Token } from '@/models';

export async function GET() {
  try {
    await connectToDatabase();
    const tokens = await Token.find().sort({ timestamp: -1 });
    return NextResponse.json({ success: true, tokens });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Database connection failed' 
    }, { status: 500 });
  }
} 