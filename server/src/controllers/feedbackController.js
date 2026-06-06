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
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    // Fetch all for aggregate stats, paginated slice for list
    const [allFeedbacks, totalCount] = await Promise.all([
      Feedback.find({ shopId }).sort({ createdAt: -1 }).select('rating sentiment topics'),
      Feedback.countDocuments({ shopId }),
    ]);

    const recentFeedbacks = await Feedback.find({ shopId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    let totalScore = 0;
    const topicCounts = {};

    allFeedbacks.forEach((f) => {
      if (f.sentiment) sentimentCounts[f.sentiment] = (sentimentCounts[f.sentiment] || 0) + 1;
      totalScore += f.rating;
      (f.topics || []).forEach((t) => {
        topicCounts[t] = (topicCounts[t] || 0) + 1;
      });
    });

    const topTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));

    res.json({
      shopId,
      totalFeedbacks: totalCount,
      averageRating: allFeedbacks.length > 0 ? Math.round((totalScore / allFeedbacks.length) * 10) / 10 : 0,
      sentimentDistribution: sentimentCounts,
      topTopics,
      recentFeedbacks,
      pagination: { page, limit, totalPages: Math.ceil(totalCount / limit), hasMore: page * limit < totalCount },
    });
  } catch (error) {
    next(error);
  }
};
