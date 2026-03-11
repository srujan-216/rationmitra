const Feedback = require('../models/Feedback');
const Shop = require('../models/Shop');
const mlService = require('../services/mlService');

exports.submitFeedback = async (req, res, next) => {
  try {
    const { shopId, rating, textFeedback } = req.body;

    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    // Create feedback
    const feedbackData = {
      userId: req.user._id,
      shopId,
      rating,
      textFeedback,
    };

    // Auto-analyze sentiment via ML service
    if (textFeedback) {
      try {
        const sentimentResult = await mlService.analyzeSentiment(textFeedback);
        feedbackData.sentiment = sentimentResult.sentiment;
        feedbackData.sentimentScore = sentimentResult.sentimentScore;
        feedbackData.topics = sentimentResult.topics || [];
      } catch {
        // ML service unavailable — save without sentiment
        console.warn('ML service unavailable for sentiment analysis');
      }
    }

    const feedback = await Feedback.create(feedbackData);

    // Update shop rating
    shop.totalRatings += 1;
    shop.rating =
      (shop.rating * (shop.totalRatings - 1) + rating) / shop.totalRatings;
    await shop.save();

    res.status(201).json({ message: 'Feedback submitted', feedback });
  } catch (error) {
    next(error);
  }
};

exports.getShopSentiment = async (req, res, next) => {
  try {
    const { shopId } = req.params;
    const feedbacks = await Feedback.find({ shopId }).sort({ createdAt: -1 }).limit(100);

    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    let totalScore = 0;
    const topicCounts = {};

    feedbacks.forEach((f) => {
      if (f.sentiment) sentimentCounts[f.sentiment]++;
      totalScore += f.rating;
      (f.topics || []).forEach((t) => {
        topicCounts[t] = (topicCounts[t] || 0) + 1;
      });
    });

    // Sort topics by frequency
    const topTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));

    res.json({
      shopId,
      totalFeedbacks: feedbacks.length,
      averageRating: feedbacks.length > 0 ? Math.round((totalScore / feedbacks.length) * 10) / 10 : 0,
      sentimentDistribution: sentimentCounts,
      topTopics,
      recentFeedbacks: feedbacks.slice(0, 10),
    });
  } catch (error) {
    next(error);
  }
};
