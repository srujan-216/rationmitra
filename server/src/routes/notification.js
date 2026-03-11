const router = require('express').Router();
const Notification = require('../models/Notification');
const authenticate = require('../middleware/auth');

router.get('/my', authenticate, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ notifications });
  } catch (error) {
    next(error);
  }
});

router.get('/unread-count', authenticate, async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      status: 'sent',
      deliveredAt: null,
    });
    res.json({ unreadCount: count });
  } catch (error) {
    next(error);
  }
});

router.put('/mark-read/:id', authenticate, async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { deliveredAt: new Date() });
    res.json({ message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
