import mongoose from 'mongoose';

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
    enum: ['rocket', 'poop', 'like'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Ensure one reaction per user per token
reactionSchema.index({ tokenAddress: 1, clerkUserId: 1 }, { unique: true });

const Reaction = mongoose.models.Reaction || mongoose.model('Reaction', reactionSchema);

export default Reaction; 