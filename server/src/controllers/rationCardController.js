const RationCard = require('../models/RationCard');
const FamilyRequest = require('../models/FamilyRequest');
const { CARD_TYPES, TELANGANA_DISTRICTS } = require('../utils/telangana');

exports.getMyCard = async (req, res, next) => {
  try {
    const card = await RationCard.findOne({ headOfFamily: req.user._id })
      .populate('assignedFPS', 'name address');
    if (!card) {
      return res.status(404).json({ message: 'Ration card not found' });
    }
    res.json({ card });
  } catch (error) {
    next(error);
  }
};

exports.getCardById = async (req, res, next) => {
  try {
    const card = await RationCard.findById(req.params.id)
      .populate('headOfFamily', 'name email phone')
      .populate('assignedFPS');
    if (!card) {
      return res.status(404).json({ message: 'Ration card not found' });
    }
    res.json({ card });
  } catch (error) {
    next(error);
  }
};

exports.createCard = async (req, res, next) => {
  try {
    const { cardType, district } = req.body;

    if (!CARD_TYPES.includes(cardType)) {
      return res.status(400).json({ message: `Invalid card type. Must be one of: ${CARD_TYPES.join(', ')}` });
    }
    if (!TELANGANA_DISTRICTS.includes(district)) {
      return res.status(400).json({ message: `Invalid district. Must be a valid Telangana district.` });
    }

    const card = await RationCard.create(req.body);
    res.status(201).json({ message: 'Ration card created', card });
  } catch (error) {
    next(error);
  }
};

exports.updateCard = async (req, res, next) => {
  try {
    const card = await RationCard.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!card) {
      return res.status(404).json({ message: 'Ration card not found' });
    }
    res.json({ message: 'Ration card updated', card });
  } catch (error) {
    next(error);
  }
};

exports.searchCards = async (req, res, next) => {
  try {
    const { cardNumber, district, mandal, cardType, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (cardNumber) filter.cardNumber = new RegExp(cardNumber, 'i');
    if (district) filter.district = district;
    if (mandal) filter.mandal = mandal;
    if (cardType) filter.cardType = cardType;

    const skip = (Number(page) - 1) * Number(limit);
    const [cards, total] = await Promise.all([
      RationCard.find(filter).skip(skip).limit(Number(limit)),
      RationCard.countDocuments(filter),
    ]);

    res.json({
      cards,
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

exports.submitFamilyRequest = async (req, res, next) => {
  try {
    const { rationCardId, type, memberDetails, memberIndex, reason } = req.body;

    const requestData = {
      type,
      rationCardId,
      requestedBy: req.user._id,
      memberDetails,
      memberIndex,
      reason,
    };

    if (req.file) {
      requestData.certificateUrl = req.file.path;
    }

    const familyRequest = await FamilyRequest.create(requestData);
    res.status(201).json({ message: 'Family request submitted', familyRequest });
  } catch (error) {
    next(error);
  }
};

exports.getMyFamilyRequests = async (req, res, next) => {
  try {
    const requests = await FamilyRequest.find({ requestedBy: req.user._id })
      .populate('rationCardId', 'cardNumber')
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error) {
    next(error);
  }
};

exports.getPendingFamilyRequests = async (req, res, next) => {
  try {
    const requests = await FamilyRequest.find({ status: 'pending' })
      .populate('requestedBy', 'name')
      .populate('rationCardId', 'cardNumber district')
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error) {
    next(error);
  }
};

exports.reviewFamilyRequest = async (req, res, next) => {
  try {
    const { status, reviewNotes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    const familyRequest = await FamilyRequest.findById(req.params.id);
    if (!familyRequest) {
      return res.status(404).json({ message: 'Family request not found' });
    }
    if (familyRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been reviewed' });
    }

    familyRequest.status = status;
    familyRequest.reviewNotes = reviewNotes;
    familyRequest.reviewedBy = req.user._id;
    familyRequest.reviewedAt = new Date();

    if (status === 'approved') {
      const card = await RationCard.findById(familyRequest.rationCardId);
      if (!card) {
        return res.status(404).json({ message: 'Associated ration card not found' });
      }

      if (familyRequest.type === 'addition') {
        card.familyMembers.push(familyRequest.memberDetails);
      } else if (familyRequest.type === 'deletion') {
        if (
          familyRequest.memberIndex != null &&
          card.familyMembers[familyRequest.memberIndex]
        ) {
          card.familyMembers[familyRequest.memberIndex].status = 'removed';
        }
      }

      await card.save();
    }

    await familyRequest.save();
    res.json({ message: `Family request ${status}`, familyRequest });
  } catch (error) {
    next(error);
  }
};
