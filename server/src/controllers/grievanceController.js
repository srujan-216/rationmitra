const Grievance = require('../models/Grievance');

exports.fileGrievance = async (req, res, next) => {
  try {
    const { type, description, shopId } = req.body;

    let priority = 'low';
    if (type === 'denial' || type === 'corruption') {
      priority = 'high';
    } else if (type === 'quality') {
      priority = 'medium';
    }

    const grievanceData = {
      userId: req.user._id,
      type,
      description,
      shopId,
      priority,
      timeline: [
        {
          status: 'open',
          updatedBy: req.user._id,
          notes: 'Grievance filed',
          timestamp: new Date(),
        },
      ],
    };

    if (req.file) {
      grievanceData.attachmentUrl = req.file.path;
    }

    const grievance = await Grievance.create(grievanceData);
    res.status(201).json({ message: 'Grievance filed successfully', grievance });
  } catch (error) {
    next(error);
  }
};

exports.getMyGrievances = async (req, res, next) => {
  try {
    const grievances = await Grievance.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ grievances });
  } catch (error) {
    next(error);
  }
};

exports.getAllGrievances = async (req, res, next) => {
  try {
    const { status, priority, type, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (type) filter.type = type;

    const skip = (Number(page) - 1) * Number(limit);
    const [grievances, total] = await Promise.all([
      Grievance.find(filter)
        .populate('userId', 'name')
        .populate('shopId', 'name')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Grievance.countDocuments(filter),
    ]);

    res.json({
      grievances,
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

exports.getGrievanceById = async (req, res, next) => {
  try {
    const grievance = await Grievance.findById(req.params.id)
      .populate('userId', 'name')
      .populate('shopId', 'name')
      .populate('assignedTo', 'name')
      .populate('timeline.updatedBy', 'name');
    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }
    res.json({ grievance });
  } catch (error) {
    next(error);
  }
};

exports.updateGrievanceStatus = async (req, res, next) => {
  try {
    const { status, notes, assignedTo } = req.body;

    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    grievance.status = status;
    if (assignedTo) grievance.assignedTo = assignedTo;

    grievance.timeline.push({
      status,
      updatedBy: req.user._id,
      notes,
      timestamp: new Date(),
    });

    if (status === 'resolved') {
      grievance.resolvedAt = new Date();
    }

    await grievance.save();
    res.json({ message: 'Grievance status updated', grievance });
  } catch (error) {
    next(error);
  }
};

exports.getGrievanceStats = async (req, res, next) => {
  try {
    const [byStatus, byType, byPriority, resolutionData] = await Promise.all([
      Grievance.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Grievance.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      Grievance.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Grievance.aggregate([
        { $match: { status: 'resolved', resolvedAt: { $exists: true } } },
        {
          $project: {
            resolutionDays: {
              $divide: [
                { $subtract: ['$resolvedAt', '$createdAt'] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
        { $group: { _id: null, avgDays: { $avg: '$resolutionDays' } } },
      ]),
    ]);

    res.json({
      byStatus,
      byType,
      byPriority,
      avgResolutionDays: resolutionData[0]
        ? Math.round(resolutionData[0].avgDays * 10) / 10
        : 0,
    });
  } catch (error) {
    next(error);
  }
};
