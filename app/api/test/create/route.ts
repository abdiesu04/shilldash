import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { Token } from '@/models';

export async function GET() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await connectToDatabase();
    
    console.log('Creating test token...');
    const testToken = new Token({
      contractAddress: 'test-address-123',
      name: 'Test Token',
      symbol: 'TEST',
      logo: 'https://example.com/logo.png',
      price: 1.0,
      metadata: {
        market_cap: 1000000,
        volume_24h: 50000
      },
      addedBy: 'test-user'
    });

    console.log('Saving test token...');
    const savedToken = await testToken.save();
    console.log('Test token saved successfully:', savedToken);

    return NextResponse.json({ 
      success: true, 
      message: 'Test token created successfully',
      token: savedToken 
    });
  } catch (error) {
    console.error('Test creation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create test token' 
    }, { status: 500 });
  }
} 