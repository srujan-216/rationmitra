const Queue = require('../models/Queue');
const User = require('../models/User');
const Shop = require('../models/Shop');
const Inventory = require('../models/Inventory');
const Feedback = require('../models/Feedback');
const FraudAlert = require('../models/FraudAlert');
const AuditLog = require('../models/AuditLog');

exports.getDashboard = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, totalShops, todayQueues, lowStockItems, recentFeedbacks, openAlerts, usersByRole] =
      await Promise.all([
        User.countDocuments({ isActive: true }),
        Shop.countDocuments({ isActive: true }),
        Queue.find({ date: today }),
        Inventory.countDocuments({ isLowStock: true }),
        Feedback.find().sort({ createdAt: -1 }).limit(5),
        FraudAlert.countDocuments({ status: 'open' }),
        User.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$role', count: { $sum: 1 } } },
        ]),
      ]);

    let totalWaiting = 0;
    let totalServed = 0;
    let totalServiceTime = 0;
    let servedWithTime = 0;

    todayQueues.forEach((q) => {
      q.queueEntries.forEach((e) => {
        if (e.status === 'waiting') totalWaiting++;
        if (e.status === 'completed') {
          totalServed++;
          if (e.serviceTime) {
            totalServiceTime += e.serviceTime;
            servedWithTime++;
          }
        }
      });
    });

    const roleDistribution = {};
    usersByRole.forEach((r) => { roleDistribution[r._id] = r.count; });

    res.json({
      totalUsers,
      totalShops,
      todayStats: {
        totalBookings: todayQueues.reduce((sum, q) => sum + q.queueEntries.length, 0),
        totalWaiting,
        totalServed,
        avgServiceTime: servedWithTime > 0 ? Math.round(totalServiceTime / servedWithTime) : 0,
      },
      lowStockItems,
      openFraudAlerts: openAlerts,
      roleDistribution,
      recentFeedbacks,
    });
  } catch (error) {
    next(error);
  }
};

exports.getFraudAlerts = async (req, res, next) => {
  try {
    const alerts = await FraudAlert.find()
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ alerts });
  } catch (error) {
    next(error);
  }
};

exports.updateFraudAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const alert = await FraudAlert.findByIdAndUpdate(id, { status }, { new: true });
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json({ message: 'Alert updated', alert });
  } catch (error) {
    next(error);
  }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('userId', 'name email role');
    const total = await AuditLog.countDocuments();
    res.json({ logs, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

exports.getShopPerformance = async (req, res, next) => {
  try {
    const shops = await Shop.find({ isActive: true }).select('name rating totalRatings');

    const performance = await Promise.all(
      shops.map(async (shop) => {
        const [feedbackCount, avgSentiment, todayQueue] = await Promise.all([
          Feedback.countDocuments({ shopId: shop._id }),
          Feedback.aggregate([
            { $match: { shopId: shop._id, sentimentScore: { $exists: true } } },
            { $group: { _id: null, avg: { $avg: '$sentimentScore' } } },
          ]),
          Queue.find({ shopId: shop._id, date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
        ]);

        let todayServed = 0;
        let todayTotal = 0;
        todayQueue.forEach((q) => {
          q.queueEntries.forEach((e) => {
            todayTotal++;
            if (e.status === 'completed') todayServed++;
          });
        });

        return {
          shopId: shop._id,
          name: shop.name,
          rating: shop.rating,
          totalRatings: shop.totalRatings,
          feedbackCount,
          avgSentiment: avgSentiment[0]?.avg ?? 0,
          todayBookings: todayTotal,
          todayServed,
          efficiency: todayTotal > 0 ? Math.round((todayServed / todayTotal) * 100) : 0,
        };
      })
    );

    res.json({ performance: performance.sort((a, b) => b.rating - a.rating) });
  } catch (error) {
    next(error);
  }
};
