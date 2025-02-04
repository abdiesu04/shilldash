import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { Token } from '@/models';
import { fetchTokenData } from '@/utils/solanaTokenUtils';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ address: string }> }
) {
  console.log('GET Request received');
  
  try {
    const params = await context.params;
    const { address } = params;
    console.log('Address from params:', address);

    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Database connected');
    
    if (!address) {
      console.log('No address provided');
      return NextResponse.json(
        { error: 'Token address is required' },
        { status: 400 }
      );
    }

    try {
      console.log('Fetching token data for address:', address);
      const tokenData = await fetchTokenData(address);
      console.log('Token data received:', tokenData);
      
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
  context: { params: Promise<{ address: string }> }
) {
  console.log('DELETE Request received');
  
  try {
    const params = await context.params;
    const { address } = params;
    console.log('Address from params:', address);
    
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Database connected');
    
    if (!address) {
      console.log('No address provided');
      return NextResponse.json(
        { error: 'Token address is required' },
        { status: 400 }
      );
    }

    const result = await Token.findOneAndDelete({ contractAddress: address });
    console.log('Delete operation result:', result);

    if (!result) {
      console.log('Token not found');
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }

    console.log('Token deleted successfully');
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