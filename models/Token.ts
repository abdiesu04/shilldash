import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['fire', 'poop', 'rocket'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const tokenSchema = new mongoose.Schema({
  contractAddress: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  symbol: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  metadata: {
    market_cap: {
      type: Number,
      required: true,
    },
    volume_24h: {
      type: Number,
      required: true,
    },
    price_change_24h: {
      type: Number,
      required: true,
    },
  },
  reactions: {
    type: [reactionSchema],
    default: [],
  },
  reactionCounts: {
    fire: { type: Number, default: 0 },
    poop: { type: Number, default: 0 },
    rocket: { type: Number, default: 0 }
  },
  clerkUserId: {
    type: String,
    required: true,
    index: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for user's tokens
tokenSchema.index({ clerkUserId: 1, contractAddress: 1 });
// Create index for reactions
tokenSchema.index({ 'reactions.userId': 1, contractAddress: 1 });

const Token = mongoose.models.Token || mongoose.model('Token', tokenSchema);

export default Token; 