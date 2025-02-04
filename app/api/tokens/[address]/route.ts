import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { Token } from '@/models';
import { fetchTokenData } from '@/utils/solanaTokenUtils';

type Props = {
  params: {
    address: string;
  };
};

export async function GET(
  request: NextRequest,
  context: Props
) {
  try {
    // Connect to database
    await connectToDatabase();

    // Simplify address retrieval 
    const address = context.params.address;
    
    if (!address) {
      return NextResponse.json(
        { error: 'Token address is required' },
        { status: 400 }
      );
    }

    try {
      // Fetch token data from Solana blockchain and market APIs
      const tokenData = await fetchTokenData(address);
      
      // Return the token data
      return NextResponse.json(tokenData);
    } catch (error) {
      console.error('Error fetching token data:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to fetch token data' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: Props
) {
  try {
    await connectToDatabase();
    
    const address = context.params.address;
    
    if (!address) {
      return NextResponse.json(
        { error: 'Token address is required' },
        { status: 400 }
      );
    }

    // Find and delete the token
    const result = await Token.findOneAndDelete({ contractAddress: address });

    if (!result) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Token deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting token:', error);
    return NextResponse.json(
      { error: 'Failed to delete token' },
      { status: 500 }
    );
  }
}