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
    index: true,
  },
  symbol: {
    type: String,
    required: true,
    index: true,
  },
  logo: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    index: true,
  },
  metadata: {
    market_cap: {
      type: Number,
      required: true,
      index: true,
    },
    volume_24h: {
      type: Number,
      required: true,
      index: true,
    },
    price_change_24h: {
      type: Number,
      required: true,
      index: true,
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
    index: true,
  },
}, {
  timestamps: true
});

const userSchema = new mongoose.Schema({
  clerkUserId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true,
  },
  email: { 
    type: String, 
    required: true,
    index: true,
  },
  walletAddress: {
    type: String,
    sparse: true,
    index: true,
  },
  savedTokens: [{
    type: String,
    index: true,
  }],
  addedTokens: [{
    type: String,
    index: true,
  }],
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true,
  }
}, {
  timestamps: true
});

const reactionSchema = new mongoose.Schema({
  tokenAddress: { 
    type: String, 
    required: true,
    index: true,
  },
  clerkUserId: { 
    type: String, 
    required: true,
    index: true,
  },
  type: {
    type: String, 
    required: true,
    enum: ['rocket', 'poop', 'like'],
    index: true,
  },
  createdAt: {
    type: Date, 
    default: Date.now,
    index: true,
  }
});

// Ensure one reaction per user per token
reactionSchema.index({ tokenAddress: 1, clerkUserId: 1 }, { unique: true });

// Compound indexes for common query patterns
tokenSchema.index({ clerkUserId: 1, contractAddress: 1 });
tokenSchema.index({ symbol: 1, price: -1 });
tokenSchema.index({ 'metadata.market_cap': -1 });
tokenSchema.index({ 'metadata.volume_24h': -1 });
tokenSchema.index({ lastUpdated: -1, price: -1 });

userSchema.index({ clerkUserId: 1, 'savedTokens': 1 });
userSchema.index({ clerkUserId: 1, 'addedTokens': 1 });
userSchema.index({ email: 1, clerkUserId: 1 });

// Create models
export const Token = mongoose.models.Token || mongoose.model('Token', tokenSchema);
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Reaction = mongoose.models.Reaction || mongoose.model('Reaction', reactionSchema); 