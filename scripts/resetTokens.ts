import { connectToDatabase } from '@/utils/database';
import Token from '@/models/Token';
import { mockTokenData } from '@/utils/mockTokenData';

async function resetTokens() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();

    // Delete all existing tokens
    console.log('Deleting existing tokens...');
    await Token.deleteMany({});

    // Add mock tokens with reaction fields
    console.log('Adding mock tokens...');
    const mockTokens = Object.entries(mockTokenData).map(([contractAddress, data]) => ({
      contractAddress,
      ...data,
      reactions: [],
      reactionCounts: {
        fire: 0,
        poop: 0,
        rocket: 0
      },
      clerkUserId: 'system', // You can change this to your admin user ID
    }));

    await Token.insertMany(mockTokens);
    console.log('Successfully reset tokens with reaction fields');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting tokens:', error);
    process.exit(1);
  }
}

// Execute if this is the main module
if (require.main === module) {
  resetTokens();
} 