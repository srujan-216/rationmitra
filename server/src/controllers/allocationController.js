const Allocation = require('../models/Allocation');
const Distribution = require('../models/Distribution');

exports.createAllocation = async (req, res, next) => {
  try {
    const { month, year, district, shopId, commodities } = req.body;

    const allocation = await Allocation.create({
      month,
      year,
      district,
      shopId,
      commodities,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: 'Allocation created', allocation });
  } catch (error) {
    next(error);
  }
};

exports.bulkCreateAllocations = async (req, res, next) => {
  try {
    const { month, year, district, shopIds, commodities } = req.body;

    const allocations = await Allocation.insertMany(
      shopIds.map((shopId) => ({
        month,
        year,
        district,
        shopId,
        commodities,
        createdBy: req.user._id,
      }))
    );

    res.status(201).json({
      message: `${allocations.length} allocations created`,
      allocations,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllocations = async (req, res, next) => {
  try {
    const { month, year, district, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);
    if (district) filter.district = district;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [allocations, total] = await Promise.all([
      Allocation.find(filter)
        .populate('shopId', 'name')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Allocation.countDocuments(filter),
    ]);

    res.json({
      allocations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getShopAllocation = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const filter = { shopId: req.user.shopAssignedTo };
    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);

    const allocations = await Allocation.find(filter).sort({ createdAt: -1 });
    res.json({ allocations });
  } catch (error) {
    next(error);
  }
};

exports.acknowledgeReceipt = async (req, res, next) => {
  try {
    const { commodities } = req.body; // [{ name, receivedQty }]

    const allocation = await Allocation.findById(req.params.id);
    if (!allocation) {
      return res.status(404).json({ message: 'Allocation not found' });
    }

    let hasDiscrepancy = false;
    allocation.commodities = allocation.commodities.map((ac) => {
      const received = commodities.find((c) => c.name === ac.name);
      if (received) {
        ac.receivedQty = received.receivedQty;
        if (received.receivedQty !== ac.allocatedQty) {
          hasDiscrepancy = true;
        }
      }
      return ac;
    });

    allocation.status = hasDiscrepancy ? 'discrepancy' : 'received';
    allocation.receiptDate = new Date();
    allocation.receiptAcknowledgedBy = req.user._id;

    await allocation.save();
    res.json({ message: 'Receipt acknowledged', allocation });
  } catch (error) {
    next(error);
  }
};

exports.getAllocationComparison = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    const matchStage = {};
    if (month) matchStage.month = Number(month);
    if (year) matchStage.year = Number(year);

    const allocationData = await Allocation.aggregate([
      { $match: matchStage },
      { $unwind: '$commodities' },
      {
        $group: {
          _id: { district: '$district', commodity: '$commodities.name' },
          totalAllocated: { $sum: '$commodities.allocatedQty' },
          totalReceived: { $sum: { $ifNull: ['$commodities.receivedQty', 0] } },
        },
      },
    ]);

    const distributionMatch = {};
    if (month) distributionMatch.month = Number(month);
    if (year) distributionMatch.year = Number(year);

    const distributionData = await Distribution.aggregate([
      { $match: distributionMatch },
      {
        $lookup: {
          from: 'rationcards',
          localField: 'rationCardId',
          foreignField: '_id',
          as: 'card',
        },
      },
      { $unwind: '$card' },
      { $unwind: '$commodities' },
      {
        $group: {
          _id: { district: '$card.district', commodity: '$commodities.name' },
          totalDistributed: { $sum: '$commodities.distributedQty' },
        },
      },
    ]);

    // Merge the two datasets
    const comparisonMap = {};
    for (const a of allocationData) {
      const key = `${a._id.district}|${a._id.commodity}`;
      comparisonMap[key] = {
        district: a._id.district,
        commodity: a._id.commodity,
        allocated: a.totalAllocated,
        received: a.totalReceived,
        distributed: 0,
      };
    }
    for (const d of distributionData) {
      const key = `${d._id.district}|${d._id.commodity}`;
      if (comparisonMap[key]) {
        comparisonMap[key].distributed = d.totalDistributed;
      } else {
        comparisonMap[key] = {
          district: d._id.district,
          commodity: d._id.commodity,
          allocated: 0,
          received: 0,
          distributed: d.totalDistributed,
        };
      }
    }

    res.json({ comparison: Object.values(comparisonMap) });
  } catch (error) {
    next(error);
  }
};
