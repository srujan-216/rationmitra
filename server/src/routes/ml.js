const router = require('express').Router();
const authenticate = require('../middleware/auth');
const mlService = require('../services/mlService');

router.post('/predict-demand', authenticate, async (req, res, next) => {
  try {
    const result = await mlService.predictDemand(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/recommend-slots', authenticate, async (req, res, next) => {
  try {
    const result = await mlService.recommendSlots(req.body);
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
