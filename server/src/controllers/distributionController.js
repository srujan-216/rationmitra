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
    const { rationCardId, commodities, verificationMethod, remarks } = req.body;

    const card = await RationCard.findById(rationCardId);
    if (!card) {
      return res.status(404).json({ message: 'Ration card not found' });
    }

    if (String(card.assignedFPS) !== String(req.user.shopAssignedTo)) {
      return res.status(403).json({ message: 'This card is not assigned to your shop' });
    }

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const existing = await Distribution.findOne({ rationCardId, month, year });
    if (existing) {
      return res.status(400).json({ message: 'Distribution already recorded for this card this month' });
    }

    const entitlements = calculateEntitlements(card);

    const distributedCommodities = commodities.map((c) => {
      const entitlement = entitlements.find((e) => e.name === c.name);
      if (!entitlement) {
        throw Object.assign(new Error(`Commodity ${c.name} is not entitled for this card type`), { statusCode: 400 });
      }
      if (c.distributedQty > entitlement.entitledQty) {
        throw Object.assign(new Error(`Distributed quantity for ${c.name} exceeds entitlement (${entitlement.entitledQty})`), { statusCode: 400 });
      }
      return {
        name: c.name,
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
      rationCardId,
      shopId: req.user.shopAssignedTo,
      month,
      year,
      commodities: distributedCommodities,
      distributedBy: req.user._id,
      verificationMethod: verificationMethod || 'manual',
      digitalSignatureHash,
      remarks,
    });

    res.status(201).json({ message: 'Distribution recorded', distribution });
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

    res.json({ distributions });
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
      });
    if (!distribution) {
      return res.status(404).json({ message: 'Distribution record not found' });
    }
    res.json({ distribution });
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
    const card = await RationCard.findById(req.params.cardId);
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

    res.json({
      card,
      entitlements,
      alreadyDistributed: !!alreadyDistributed,
    });
  } catch (error) {
    next(error);
  }
};
