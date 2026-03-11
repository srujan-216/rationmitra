const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    textFeedback: { type: String, trim: true },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
    sentimentScore: { type: Number, min: -1, max: 1 },
    topics: [{ type: String }],
    isResolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
