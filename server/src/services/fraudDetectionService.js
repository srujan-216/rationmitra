const FraudAlert = require('../models/FraudAlert');
const FaceData = require('../models/FaceData');
const Queue = require('../models/Queue');

const checkVerificationFraud = async (userId, userName, shopId) => {
  const faceData = await FaceData.findOne({ userId });
  if (!faceData) return;

  // Alert on repeated verification failures (>3 in 24 hours)
  if (faceData.failureCount > 0 && faceData.failureCount % 3 === 0) {
    await FraudAlert.create({
      userId,
      userName,
      shopId,
      alertType: 'repeated_failures',
      description: `User has ${faceData.failureCount} face verification failures. Possible identity fraud.`,
      severity: faceData.failureCount >= 9 ? 'critical' : faceData.failureCount >= 6 ? 'high' : 'medium',
    });
  }
};

const checkDuplicateBooking = async (userId, userName, date) => {
  // Check if user has bookings at multiple shops on the same day
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const bookings = await Queue.find({
    date: { $gte: dayStart, $lte: dayEnd },
    'queueEntries.userId': userId,
    'queueEntries.status': { $ne: 'cancelled' },
  });

  const uniqueShops = new Set(bookings.map((q) => q.shopId.toString()));
  if (uniqueShops.size > 1) {
    await FraudAlert.create({
      userId,
      userName,
      alertType: 'multiple_bookings',
      description: `User booked at ${uniqueShops.size} different shops on the same day (${date.toISOString().split('T')[0]}).`,
      severity: 'high',
      metadata: { shopIds: [...uniqueShops], date },
    });
  }
};

const runDailyFraudScan = async () => {
  // Find users with high failure counts
  const suspiciousUsers = await FaceData.find({ failureCount: { $gte: 5 } }).populate('userId', 'name');

  for (const fd of suspiciousUsers) {
    const existing = await FraudAlert.findOne({
      userId: fd.userId?._id,
      alertType: 'repeated_failures',
      status: 'open',
    });
    if (!existing) {
      await FraudAlert.create({
        userId: fd.userId?._id,
        userName: fd.userId?.name || 'Unknown',
        alertType: 'suspicious_activity',
        description: `User has ${fd.failureCount} lifetime face verification failures.`,
        severity: 'high',
      });
    }
  }
};

module.exports = { checkVerificationFraud, checkDuplicateBooking, runDailyFraudScan };
