const router = require('express').Router();
const feedbackController = require('../controllers/feedbackController');
const authenticate = require('../middleware/auth');

router.post('/submit', authenticate, feedbackController.submitFeedback);
router.get('/shop-sentiment/:shopId', authenticate, feedbackController.getShopSentiment);

module.exports = router;
