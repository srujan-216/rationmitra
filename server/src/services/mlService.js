const { mlServiceUrl } = require('../config/env');

const callML = async (endpoint, body = {}) => {
  const url = `${mlServiceUrl}${endpoint}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `ML service error: ${response.status}`);
  }
  return response.json();
};

exports.predictDemand = (data) => callML('/api/ml/predict-demand', data);
exports.recommendSlots = (data) => callML('/api/ml/recommend-slots', data);
exports.analyzeSentiment = (text) => callML('/api/ml/analyze-sentiment', { text });
exports.batchSentiment = (texts) => callML('/api/ml/batch-sentiment', { texts });
exports.generateFaceEmbedding = (image) => callML('/api/ml/face/generate-embedding', { image });
exports.verifyFace = (liveImage, storedEmbedding) => callML('/api/ml/face/verify', { liveImage, storedEmbedding });
exports.forecastStock = (data) => callML('/api/ml/forecast-stock', data);
exports.batchForecastStock = (items) => callML('/api/ml/batch-forecast-stock', { items });

exports.checkHealth = async () => {
  try {
    const response = await fetch(`${mlServiceUrl}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
};
