import { NextResponse } from 'next/server';
import { getTokenMetadata } from '@/utils/api';
import { PublicKey } from '@solana/web3.js';

export async function POST(request: Request) {
  try {
    const { contractAddress } = await request.json();

    // Validate Solana address format
    try {
      new PublicKey(contractAddress);
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid Solana contract address' },
        { status: 400 }
      );
    }

    // Fetch token metadata from CoinGecko
    const tokenMetadata = await getTokenMetadata(contractAddress);

    return NextResponse.json({
      isValid: true,
      metadata: tokenMetadata
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      {
        isValid: false,
        message: error instanceof Error ? error.message : 'Validation failed'
      },
      { status: 400 }
    );
  }
} 