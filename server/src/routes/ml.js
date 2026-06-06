const router = require('express').Router();
const authenticate = require('../middleware/auth');
const mlService = require('../services/mlService');
const Queue = require('../models/Queue');

// Build historical footfall from Queue collection (last 90 days)
const getHistoricalFootfall = async (shopId) => {
  const since = new Date();
  since.setDate(since.getDate() - 90);
  since.setHours(0, 0, 0, 0);

  const queues = await Queue.find({
    ...(shopId ? { shopId } : {}),
    date: { $gte: since },
  }).select('date queueEntries').lean();

  // Group by date → count total entries per day
  const byDate = {};
  queues.forEach((q) => {
    const key = new Date(q.date).toISOString().split('T')[0];
    byDate[key] = (byDate[key] || 0) + (q.queueEntries?.length || 0);
  });

  return Object.entries(byDate)
    .map(([date, footfall]) => ({ date, footfall }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

router.post('/predict-demand', authenticate, async (req, res, next) => {
  try {
    const { shopId, date, numDays } = req.body;
    const historicalData = await getHistoricalFootfall(shopId);
    const result = await mlService.predictDemand({ date, numDays, historicalData });
    res.json({ ...result, dataPoints: historicalData.length });
  } catch (error) {
    next(error);
  }
});

router.post('/recommend-slots', authenticate, async (req, res, next) => {
  try {
    const { shopId, date, slots } = req.body;
    const historicalData = await getHistoricalFootfall(shopId);
    const result = await mlService.recommendSlots({ date, slots, historicalData });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/analyze-sentiment', authenticate, async (req, res, next) => {
  try {
    const result = await mlService.analyzeSentiment(req.body.text);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/forecast-stock', authenticate, async (req, res, next) => {
  try {
    // Route to batch or single endpoint based on payload
    const result = req.body.items
      ? await mlService.batchForecastStock(req.body.items)
      : await mlService.forecastStock(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/status', authenticate, async (req, res) => {
  const healthy = await mlService.checkHealth();
  res.json({ mlServiceOnline: healthy });
});

module.exports = router;
