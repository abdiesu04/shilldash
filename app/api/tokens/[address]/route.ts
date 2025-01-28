import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { Token } from '@/models';

interface TokenData {
  _id: string;
  contractAddress: string;
  name: string;
  symbol: string;
  logo: string;
  price: number;
  metadata: {
    market_cap: number;
    volume_24h: number;
    price_change_24h: number;
  };
  clerkUserId: string;
  lastUpdated: Date;
}

interface ChartDataPoint {
  labels: string[];
  prices: number[];
}

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    await connectToDatabase();
    
    // Generate time ranges for different periods
    const now = Date.now();
    const timeRanges = {
      '24h': {
        start: now - 24 * 60 * 60 * 1000,
        points: 24,
        format: (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      '7d': {
        start: now - 7 * 24 * 60 * 60 * 1000,
        points: 7 * 24,
        format: (date: Date) => date.toLocaleDateString([], { month: 'short', day: 'numeric' })
      },
      '30d': {
        start: now - 30 * 24 * 60 * 60 * 1000,
        points: 30,
        format: (date: Date) => date.toLocaleDateString([], { month: 'short', day: 'numeric' })
      }
    };

    // Find token data
    const tokenDoc = await Token.findOne({ contractAddress: params.address }).lean();
    if (!tokenDoc) {
      return NextResponse.json(
        { message: 'Token not found' },
        { status: 404 }
      );
    }

    // Cast the document to our expected type
    const token = tokenDoc as unknown as TokenData;

    // Generate chart data for each time range
    const chartData: Record<string, ChartDataPoint> = {};
    const basePrice = token.price;
    
    for (const [period, range] of Object.entries(timeRanges)) {
      const { start, points, format } = range;
      const interval = (now - start) / points;
      
      const data: ChartDataPoint = {
        labels: [],
        prices: [],
      };

      // Generate price points with some randomness based on current price
      const volatility = basePrice * (period === '24h' ? 0.05 : period === '7d' ? 0.15 : 0.25);
      let lastPrice = basePrice;

      for (let i = 0; i <= points; i++) {
        const timestamp = new Date(start + interval * i);
        data.labels.push(format(timestamp));
        
        // Generate more realistic price movements
        const change = (Math.random() - 0.45) * volatility; // Slight upward bias
        lastPrice = Math.max(0, lastPrice + change); // Prevent negative prices
        data.prices.push(lastPrice);
      }

      // Ensure the last point matches the current price
      data.labels.push(format(new Date(now)));
      data.prices.push(basePrice);

      chartData[period] = data;
    }

    // Calculate additional statistics
    const priceHigh = Math.max(...chartData['24h'].prices);
    const priceLow = Math.min(...chartData['24h'].prices);
    const priceChange = basePrice - chartData['24h'].prices[0];
    const priceChangePercentage = (priceChange / chartData['24h'].prices[0]) * 100;

    return NextResponse.json({
      token: {
        ...token,
        chartData,
        statistics: {
          high_24h: priceHigh,
          low_24h: priceLow,
          price_change_24h: priceChange,
          price_change_percentage_24h: priceChangePercentage,
          updated_at: new Date(now).toISOString()
        }
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