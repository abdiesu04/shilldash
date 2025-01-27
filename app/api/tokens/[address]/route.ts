import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { Token } from '@/models';

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    await connectToDatabase();
    
    const token = await Token.findOne({ contractAddress: params.address });
    if (!token) {
      return NextResponse.json(
        { message: 'Token not found' },
        { status: 404 }
      );
    }

    // Generate sample chart data (replace this with actual historical data from CoinGecko)
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const timePoints = 24; // One point per hour
    const interval = (now - oneDayAgo) / timePoints;

    const chartData: { labels: string[]; prices: number[] } = {
      labels: [],
      prices: [],
    };

    // Generate price points with some randomness based on current price
    const basePrice = token.price;
    const volatility = basePrice * 0.05; // 5% volatility

    for (let i = 0; i < timePoints; i++) {
      const timestamp = new Date(oneDayAgo + interval * i);
      chartData.labels.push(timestamp.toLocaleTimeString());
      
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      const price = basePrice + randomChange;
      chartData.prices.push(price);
    }

    // Add current price as the last point
    chartData.labels.push(new Date(now).toLocaleTimeString());
    chartData.prices.push(basePrice);

    return NextResponse.json({
      token: {
        ...token.toObject(),
        chartData,
      },
    });
  } catch (error) {
    console.error('Error fetching token:', error);
    return NextResponse.json(
      { message: 'Error fetching token details' },
      { status: 500 }
    );
  }
} 