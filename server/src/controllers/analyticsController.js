const Queue = require('../models/Queue');
const User = require('../models/User');
const Shop = require('../models/Shop');
const Inventory = require('../models/Inventory');
const Feedback = require('../models/Feedback');
const FraudAlert = require('../models/FraudAlert');
const AuditLog = require('../models/AuditLog');
const Allocation = require('../models/Allocation');
const Distribution = require('../models/Distribution');

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

/**
 * Shop-owner dashboard — all metrics for a single shop.
 * Accepts :shopId param. Shop owners can only access their own shop (guard added in route).
 */
exports.getShopOwnerDashboard = async (req, res, next) => {
  try {
    const { shopId } = req.params;

    // Authorization: shop owners can only see their own shop.
    // Admins and sysadmins can see any shop.
    if (req.user.role === 'shopowner') {
      if (!req.user.shopAssignedTo || String(req.user.shopAssignedTo) !== String(shopId)) {
        return res.status(403).json({ message: 'You can only view your own shop dashboard' });
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const [shop, todayQueues, inventory, allocation, monthlyDistributions, recentFeedbacks] = await Promise.all([
      Shop.findById(shopId).select('name code address rating totalRatings maxCapacityPerSlot'),
      Queue.find({ shopId, date: today }),
      Inventory.find({ shopId }),
      Allocation.findOne({ shopId, month, year }).sort({ createdAt: -1 }),
      Distribution.find({ shopId, month, year }),
      Feedback.find({ shopId }).sort({ createdAt: -1 }).limit(5),
    ]);

    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    // ── Today's queue metrics ──
    let totalBookings = 0;
    let waiting = 0;
    let inService = 0;
    let completed = 0;
    let noShow = 0;
    let totalServiceTime = 0;
    let servedWithTime = 0;

    todayQueues.forEach((q) => {
      q.queueEntries.forEach((e) => {
        totalBookings++;
        if (e.status === 'waiting') waiting++;
        else if (e.status === 'in_service') inService++;
        else if (e.status === 'completed') {
          completed++;
          if (e.serviceTime) {
            totalServiceTime += e.serviceTime;
            servedWithTime++;
          }
        } else if (e.status === 'no_show') noShow++;
      });
    });

    const avgServiceTime = servedWithTime > 0 ? Math.round(totalServiceTime / servedWithTime) : 0;
    const capacityUsed = todayQueues.length > 0
      ? Math.round((totalBookings / (todayQueues.length * shop.maxCapacityPerSlot)) * 100)
      : 0;

    // ── Inventory summary ──
    const lowStockItems = inventory.filter((i) => i.isLowStock);
    const totalCurrentStock = inventory.reduce((sum, i) => sum + i.currentStock, 0);
    const inventorySummary = inventory.map((i) => ({
      itemName: i.itemName,
      currentStock: i.currentStock,
      unit: i.unit,
      reorderLevel: i.reorderLevel,
      isLowStock: i.isLowStock,
      fillPercent: i.reorderLevel > 0
        ? Math.min(100, Math.round((i.currentStock / (i.reorderLevel * 5)) * 100))
        : 100,
    }));

    // ── Allocation summary for current month ──
    let allocationStatus = null;
    if (allocation) {
      const totalAllocated = allocation.commodities.reduce((s, c) => s + (c.allocatedQty || 0), 0);
      const totalReceived = allocation.commodities.reduce((s, c) => s + (c.receivedQty || 0), 0);
      allocationStatus = {
        status: allocation.status,
        dispatchDate: allocation.dispatchDate,
        receiptDate: allocation.receiptDate,
        totalAllocated,
        totalReceived,
        percentReceived: totalAllocated > 0 ? Math.round((totalReceived / totalAllocated) * 100) : 0,
        commodities: allocation.commodities,
      };
    }

    // ── Monthly distribution (unique families served this month) ──
    const uniqueFamiliesServed = new Set(monthlyDistributions.map((d) => String(d.rationCardId))).size;
    const totalRevenue = monthlyDistributions.reduce((sum, d) => {
      return sum + d.commodities.reduce((cSum, c) => cSum + (c.distributedQty || 0) * (c.rate || 0), 0);
    }, 0);

    res.json({
      shop: {
        _id: shop._id,
        name: shop.name,
        code: shop.code,
        address: shop.address,
        rating: shop.rating,
        totalRatings: shop.totalRatings,
      },
      today: {
        totalBookings,
        waiting,
        inService,
        completed,
        noShow,
        avgServiceTime,
        capacityUsed,
      },
      inventory: {
        itemCount: inventory.length,
        lowStockCount: lowStockItems.length,
        totalCurrentStock,
        items: inventorySummary,
      },
      allocation: allocationStatus,
      month: {
        distributionsCount: monthlyDistributions.length,
        uniqueFamiliesServed,
        totalRevenue: Math.round(totalRevenue),
      },
      recentFeedbacks,
    });
  } catch (error) {
    next(error);
  }
};

exports.getWeeklyTrends = async (req, res, next) => {
  try {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push(d);
    }

    const results = await Promise.all(
      days.map(async (dayStart) => {
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
        const queues = await Queue.find({ date: { $gte: dayStart, $lte: dayEnd } });

        let bookings = 0, served = 0, noShows = 0;
        queues.forEach((q) => {
          q.queueEntries.forEach((e) => {
            bookings++;
            if (e.status === 'completed') served++;
            else if (e.status === 'no_show') noShows++;
          });
        });

        const label = dayStart.toLocaleDateString('en-IN', { weekday: 'short' });
        return { day: label, bookings, served, noShows };
      })
    );

    res.json({ trends: results });
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
