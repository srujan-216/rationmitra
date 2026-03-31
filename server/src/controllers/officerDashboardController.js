const RationCard = require('../models/RationCard');
const Distribution = require('../models/Distribution');
const FamilyRequest = require('../models/FamilyRequest');
const Grievance = require('../models/Grievance');
const Allocation = require('../models/Allocation');

exports.getOfficerDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const [
      cardsByType,
      totalCards,
      distributionsThisMonth,
      pendingFamilyRequests,
      grievancesByStatus,
      allocationSummary,
    ] = await Promise.all([
      RationCard.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$cardType', count: { $sum: 1 } } },
      ]),
      RationCard.countDocuments({ isActive: true }),
      Distribution.countDocuments({ month, year }),
      FamilyRequest.countDocuments({ status: 'pending' }),
      Grievance.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Allocation.aggregate([
        { $match: { month, year } },
        { $unwind: '$commodities' },
        {
          $group: {
            _id: null,
            totalAllocated: { $sum: '$commodities.allocatedQty' },
            totalReceived: { $sum: { $ifNull: ['$commodities.receivedQty', 0] } },
          },
        },
      ]),
    ]);

    const distributionCoverage =
      totalCards > 0
        ? Math.round((distributionsThisMonth / totalCards) * 100 * 10) / 10
        : 0;

    res.json({
      rationCards: { byType: cardsByType, total: totalCards },
      distribution: {
        thisMonth: distributionsThisMonth,
        coveragePercent: distributionCoverage,
      },
      pendingFamilyRequests,
      grievances: grievancesByStatus,
      allocation: allocationSummary[0] || { totalAllocated: 0, totalReceived: 0 },
    });
  } catch (error) {
    next(error);
  }
};

exports.getDistrictDrilldown = async (req, res, next) => {
  try {
    const { district } = req.params;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const mandalBreakdown = await RationCard.aggregate([
      { $match: { district, isActive: true } },
      {
        $group: {
          _id: '$mandal',
          totalCards: { $sum: 1 },
          cardTypes: {
            $push: '$cardType',
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get distribution counts per mandal for current month
    const distributionsByMandal = await Distribution.aggregate([
      { $match: { month, year } },
      {
        $lookup: {
          from: 'rationcards',
          localField: 'rationCardId',
          foreignField: '_id',
          as: 'card',
        },
      },
      { $unwind: '$card' },
      { $match: { 'card.district': district } },
      {
        $group: {
          _id: '$card.mandal',
          distributed: { $sum: 1 },
        },
      },
    ]);

    const distributionMap = {};
    for (const d of distributionsByMandal) {
      distributionMap[d._id] = d.distributed;
    }

    const mandals = mandalBreakdown.map((m) => ({
      mandal: m._id,
      totalCards: m.totalCards,
      distributedThisMonth: distributionMap[m._id] || 0,
      coveragePercent:
        m.totalCards > 0
          ? Math.round(((distributionMap[m._id] || 0) / m.totalCards) * 100 * 10) / 10
          : 0,
    }));

    res.json({ district, mandals });
  } catch (error) {
    next(error);
  }
};

exports.getMandalDrilldown = async (req, res, next) => {
  try {
    const { district, mandal } = req.params;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const shopBreakdown = await RationCard.aggregate([
      { $match: { district, mandal, isActive: true } },
      {
        $group: {
          _id: '$assignedFPS',
          totalCards: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'shops',
          localField: '_id',
          foreignField: '_id',
          as: 'shop',
        },
      },
      { $unwind: '$shop' },
      {
        $project: {
          shopId: '$_id',
          shopName: '$shop.name',
          totalCards: 1,
        },
      },
      { $sort: { shopName: 1 } },
    ]);

    const distributionsByShop = await Distribution.aggregate([
      { $match: { month, year } },
      {
        $lookup: {
          from: 'rationcards',
          localField: 'rationCardId',
          foreignField: '_id',
          as: 'card',
        },
      },
      { $unwind: '$card' },
      { $match: { 'card.district': district, 'card.mandal': mandal } },
      {
        $group: {
          _id: '$shopId',
          distributed: { $sum: 1 },
        },
      },
    ]);

    const distributionMap = {};
    for (const d of distributionsByShop) {
      distributionMap[String(d._id)] = d.distributed;
    }

    const shops = shopBreakdown.map((s) => ({
      shopId: s.shopId,
      shopName: s.shopName,
      totalCards: s.totalCards,
      distributedThisMonth: distributionMap[String(s.shopId)] || 0,
      coveragePercent:
        s.totalCards > 0
          ? Math.round(((distributionMap[String(s.shopId)] || 0) / s.totalCards) * 100 * 10) / 10
          : 0,
    }));

    res.json({ district, mandal, shops });
  } catch (error) {
    next(error);
  }
};
