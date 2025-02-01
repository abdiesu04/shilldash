import mongoose from 'mongoose';

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
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  metadata: {
    market_cap: {
      type: Number,
      required: true,
      default: 0,
    },
    volume_24h: mongoose.Schema.Types.Mixed,
    price_change_24h: mongoose.Schema.Types.Mixed,
    liquidity: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: 0,
    },
  },
  onChainData: {
    supply: {
      type: String,
      required: true,
    },
    decimals: {
      type: Number,
      required: true,
    },
    mintAuthority: {
      type: String,
      default: null,
    },
    freezeAuthority: {
      type: String,
      default: null,
    },
    isInitialized: {
      type: Boolean,
      required: true,
    },
  },
  description: {
    type: String,
    default: '',
  },
  urls: {
    explorers: {
      solscan: String,
      solanaFM: String,
      explorer: String,
    },
    trading: {
      raydium: String,
      jupiter: String,
      orca: String,
    },
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

// Clear existing model if it exists to prevent OverwriteModelError
mongoose.models = {};

const Token = mongoose.model('Token', tokenSchema);

export default Token; 