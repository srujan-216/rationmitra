const crypto = require('crypto');
const RationCard = require('../models/RationCard');
const Distribution = require('../models/Distribution');
const { ENTITLEMENT_RULES, COMMODITY_RATES } = require('../utils/telangana');

/**
 * Calculate entitlements for a given ration card.
 */
function calculateEntitlements(card) {
  const rules = ENTITLEMENT_RULES[card.cardType];
  const rates = COMMODITY_RATES[card.cardType];
  if (!rules) return [];

  const activeMemberCount = card.familyMembers.filter(
    (m) => m.status === 'active'
  ).length;

  const entitlements = [];
  for (const [commodity, qty] of Object.entries(rules)) {
    if (commodity === 'perMember') continue;
    if (qty <= 0) continue;

    const entitledQty = rules.perMember ? qty * activeMemberCount : qty;
    entitlements.push({
      name: commodity,
      entitledQty,
      rate: rates[commodity] || 0,
    });
  }
  return entitlements;
}

exports.recordDistribution = async (req, res, next) => {
  try {
    const { cardNumber, rationCardId, commodities, verificationMethod, remarks } = req.body;

    const card = cardNumber
      ? await RationCard.findOne({ cardNumber }).populate('headOfFamily', 'name')
      : await RationCard.findById(rationCardId);
    if (!card) {
      return res.status(404).json({ message: 'Ration card not found' });
    }

    if (String(card.assignedFPS) !== String(req.user.shopAssignedTo)) {
      return res.status(403).json({ message: 'This card is not assigned to your shop' });
    }

    const cardId = card._id;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const existing = await Distribution.findOne({ rationCardId: cardId, month, year });
    if (existing) {
      return res.status(400).json({ message: 'Distribution already recorded for this card this month' });
    }

    const entitlements = calculateEntitlements(card);

    const distributedCommodities = commodities.map((c) => {
      const commodityName = c.name || c.commodityId;
      const entitlement = entitlements.find((e) => e.name === commodityName);
      if (!entitlement) {
        throw Object.assign(new Error(`Commodity ${commodityName} is not entitled for this card type`), { statusCode: 400 });
      }
      if (c.distributedQty > entitlement.entitledQty) {
        throw Object.assign(new Error(`Distributed quantity for ${commodityName} exceeds entitlement (${entitlement.entitledQty})`), { statusCode: 400 });
      }
      return {
        name: commodityName,
        entitledQty: entitlement.entitledQty,
        distributedQty: c.distributedQty,
        rate: entitlement.rate,
      };
    });

    const signaturePayload = JSON.stringify({
      rationCardId,
      commodities: distributedCommodities,
      month,
      year,
      timestamp: now.toISOString(),
    });
    const digitalSignatureHash = crypto
      .createHash('sha256')
      .update(signaturePayload)
      .digest('hex');

    const distribution = await Distribution.create({
      rationCardId: cardId,
      shopId: req.user.shopAssignedTo,
      month,
      year,
      commodities: distributedCommodities,
      distributedBy: req.user._id,
      verificationMethod: verificationMethod || 'manual',
      digitalSignatureHash,
      remarks,
    });

    res.status(201).json({
      message: 'Distribution recorded',
      distribution,
      digitalSignatureHash: distribution.digitalSignatureHash,
      ticket: distribution._id.toString().slice(-8).toUpperCase(),
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

exports.getMyDistributions = async (req, res, next) => {
  try {
    const card = await RationCard.findOne({ headOfFamily: req.user._id });
    if (!card) {
      return res.status(404).json({ message: 'Ration card not found' });
    }

    const distributions = await Distribution.find({ rationCardId: card._id })
      .populate('shopId', 'name')
      .sort({ createdAt: -1 });

    const mapped = distributions.map((d) => ({
      ...d.toObject(),
      shopName: d.shopId?.name || 'Unknown',
      totalItems: d.commodities.length,
      distributedAt: d.createdAt,
      commodities: d.commodities.map((c) => ({
        ...c,
        totalCost: +(c.distributedQty * c.rate).toFixed(2),
      })),
    }));

    res.json({ distributions: mapped });
  } catch (error) {
    next(error);
  }
};

exports.getDistributionReceipt = async (req, res, next) => {
  try {
    const distribution = await Distribution.findById(req.params.id)
      .populate({
        path: 'rationCardId',
        select: 'cardNumber headOfFamily',
        populate: { path: 'headOfFamily', select: 'name' },
      })
      .populate('shopId', 'name');
    if (!distribution) {
      return res.status(404).json({ message: 'Distribution record not found' });
    }

    const totalAmount = distribution.commodities.reduce(
      (sum, c) => sum + c.distributedQty * c.rate, 0
    );

    const receipt = {
      _id: distribution._id,
      cardNumber: distribution.rationCardId?.cardNumber || 'N/A',
      familyHeadName: distribution.rationCardId?.headOfFamily?.name || 'Unknown',
      month: distribution.month,
      year: distribution.year,
      shopName: distribution.shopId?.name || 'Unknown',
      verificationMethod: distribution.verificationMethod,
      digitalSignatureHash: distribution.digitalSignatureHash,
      distributedAt: distribution.createdAt,
      totalAmount: +totalAmount.toFixed(2),
      commodities: distribution.commodities.map((c) => ({
        name: c.name,
        qty: c.distributedQty,
        rate: c.rate,
        amount: +(c.distributedQty * c.rate).toFixed(2),
      })),
    };

    res.json(receipt);
  } catch (error) {
    next(error);
  }
};

exports.getShopDistributions = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const filter = { shopId: req.user.shopAssignedTo };
    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);

    const distributions = await Distribution.find(filter)
      .populate('rationCardId', 'cardNumber cardType')
      .sort({ createdAt: -1 });

    res.json({ distributions });
  } catch (error) {
    next(error);
  }
};

exports.getDistributionStats = async (req, res, next) => {
  try {
    const stats = await Distribution.aggregate([
      {
        $lookup: {
          from: 'rationcards',
          localField: 'rationCardId',
          foreignField: '_id',
          as: 'card',
        },
      },
      { $unwind: '$card' },
      {
        $group: {
          _id: {
            district: '$card.district',
            month: '$month',
            year: '$year',
            cardType: '$card.cardType',
          },
          totalDistributions: { $sum: 1 },
          totalCommodities: { $push: '$commodities' },
        },
      },
      {
        $project: {
          _id: 0,
          district: '$_id.district',
          month: '$_id.month',
          year: '$_id.year',
          cardType: '$_id.cardType',
          totalDistributions: 1,
        },
      },
      { $sort: { district: 1, year: -1, month: -1 } },
    ]);

    res.json({ stats });
  } catch (error) {
    next(error);
  }
};

exports.checkEntitlement = async (req, res, next) => {
  try {
    const card = await RationCard.findOne({ cardNumber: req.params.cardNumber })
      .populate('headOfFamily', 'name');
    if (!card) {
      return res.status(404).json({ message: 'Ration card not found' });
    }

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const entitlements = calculateEntitlements(card);

    const alreadyDistributed = await Distribution.findOne({
      rationCardId: card._id,
      month,
      year,
    });

    const activeMemberCount = card.familyMembers.filter((m) => m.status === 'active').length;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    res.json({
      rationCardId: card._id,
      cardNumber: card.cardNumber,
      cardType: card.cardType,
      headOfFamily: card.headOfFamily?.name || 'Unknown',
      activeMembers: activeMemberCount,
      alreadyDistributed: !!alreadyDistributed,
      monthYear: `${monthNames[month - 1]} ${year}`,
      entitlements: entitlements.map((e) => ({
        name: e.name,
        entitledQty: e.entitledQty,
        rate: e.rate,
        unit: e.name === 'Kerosene' ? 'liter' : 'kg',
      })),
    });
  } catch (error) {
    next(error);
  }
};
