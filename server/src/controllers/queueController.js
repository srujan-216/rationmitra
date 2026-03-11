const Queue = require('../models/Queue');
const Shop = require('../models/Shop');
const { notifySlotBooked, notifyServiceComplete, notifyTurnApproaching } = require('../services/notificationService');
const { checkDuplicateBooking } = require('../services/fraudDetectionService');

const generateSlots = (shop) => {
  const slots = [];
  const [openH, openM] = shop.operatingHours.open.split(':').map(Number);
  for (let i = 0; i < shop.slotsPerDay; i++) {
    const startH = openH + Math.floor((openM + i * shop.slotDurationMinutes) / 60);
    const startM = (openM + i * shop.slotDurationMinutes) % 60;
    const endH = openH + Math.floor((openM + (i + 1) * shop.slotDurationMinutes) / 60);
    const endM = (openM + (i + 1) * shop.slotDurationMinutes) % 60;
    slots.push({
      slotId: `SLOT-${i + 1}`,
      startTime: `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`,
      endTime: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
      capacity: shop.maxCapacityPerSlot,
    });
  }
  return slots;
};

exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { shopId, date } = req.params;
    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);

    const slots = generateSlots(shop);

    const existingQueues = await Queue.find({ shopId, date: queryDate });
    const bookedMap = {};
    existingQueues.forEach((q) => {
      bookedMap[q.slot.slotId] = q.slot.currentCount;
    });

    const availableSlots = slots.map((slot) => ({
      ...slot,
      currentCount: bookedMap[slot.slotId] || 0,
      available: (bookedMap[slot.slotId] || 0) < slot.capacity,
    }));

    res.json({ date, shopId, slots: availableSlots });
  } catch (error) {
    next(error);
  }
};

exports.bookSlot = async (req, res, next) => {
  try {
    const { shopId, date, slotId } = req.body;
    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);

    const slots = generateSlots(shop);
    const slotConfig = slots.find((s) => s.slotId === slotId);
    if (!slotConfig) return res.status(400).json({ message: 'Invalid slot' });

    let queue = await Queue.findOne({ shopId, date: queryDate, 'slot.slotId': slotId });

    if (!queue) {
      queue = new Queue({
        shopId,
        date: queryDate,
        slot: { ...slotConfig, currentCount: 0 },
        queueEntries: [],
      });
    }

    if (queue.slot.currentCount >= queue.slot.capacity) {
      return res.status(400).json({ message: 'Slot is full' });
    }

    const alreadyBooked = queue.queueEntries.some(
      (e) => e.userId.toString() === req.user._id.toString() && e.status !== 'cancelled'
    );
    if (alreadyBooked) {
      return res.status(400).json({ message: 'You already have a booking for this slot' });
    }

    const ticketNumber = `T${Date.now().toString(36).toUpperCase()}`;
    queue.queueEntries.push({
      userId: req.user._id,
      userName: req.user.name,
      ticketNumber,
      status: 'waiting',
    });
    queue.slot.currentCount += 1;
    await queue.save();

    // Send booking confirmation notification
    notifySlotBooked(req.user._id, ticketNumber, `${slotConfig.startTime}-${slotConfig.endTime}`).catch(() => {});

    // Check for duplicate bookings across shops (fraud detection)
    checkDuplicateBooking(req.user._id, req.user.name, queryDate).catch(() => {});

    res.status(201).json({
      message: 'Slot booked successfully',
      ticketNumber,
      position: queue.slot.currentCount,
      slot: queue.slot,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const queues = await Queue.find({
      'queueEntries.userId': req.user._id,
    }).populate('shopId', 'name address');

    const bookings = [];
    queues.forEach((q) => {
      q.queueEntries.forEach((entry) => {
        if (entry.userId.toString() === req.user._id.toString()) {
          bookings.push({
            queueId: q._id,
            shop: q.shopId,
            date: q.date,
            slot: q.slot,
            ticketNumber: entry.ticketNumber,
            status: entry.status,
            position:
              entry.status === 'waiting'
                ? q.queueEntries.filter((e) => e.status === 'waiting' && e.joinedAt <= entry.joinedAt).length
                : null,
          });
        }
      });
    });

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const queue = await Queue.findOne({ 'queueEntries._id': bookingId });

    if (!queue) return res.status(404).json({ message: 'Booking not found' });

    const entry = queue.queueEntries.id(bookingId);
    if (!entry || entry.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (entry.status !== 'waiting') {
      return res.status(400).json({ message: 'Can only cancel waiting bookings' });
    }

    entry.status = 'cancelled';
    queue.slot.currentCount -= 1;
    await queue.save();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getLiveStatus = async (req, res, next) => {
  try {
    const { shopId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const queues = await Queue.find({ shopId, date: today });

    const status = queues.map((q) => ({
      slot: q.slot,
      waiting: q.queueEntries.filter((e) => e.status === 'waiting').length,
      inService: q.queueEntries.filter((e) => e.status === 'in_service').length,
      completed: q.queueEntries.filter((e) => e.status === 'completed').length,
      currentServing: q.queueEntries.find((e) => e.status === 'in_service')?.ticketNumber || null,
    }));

    res.json({ shopId, date: today, status });
  } catch (error) {
    next(error);
  }
};

exports.markServed = async (req, res, next) => {
  try {
    const { queueId, entryId } = req.body;
    const queue = await Queue.findById(queueId);
    if (!queue) return res.status(404).json({ message: 'Queue not found' });

    const entry = queue.queueEntries.id(entryId);
    if (!entry) return res.status(404).json({ message: 'Queue entry not found' });

    entry.status = 'completed';
    entry.completedAt = new Date();
    entry.serviceTime = entry.servedAt
      ? Math.round((entry.completedAt - entry.servedAt) / 60000)
      : 0;
    await queue.save();

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`shop:${queue.shopId}`).emit('queue:completed', {
        ticketNumber: entry.ticketNumber,
        shopId: queue.shopId,
      });
    }

    // Send service complete notification
    notifyServiceComplete(entry.userId).catch(() => {});

    res.json({ message: 'Marked as served', entry });
  } catch (error) {
    next(error);
  }
};

exports.callNext = async (req, res, next) => {
  try {
    const { queueId, entryId } = req.body;
    const queue = await Queue.findById(queueId);
    if (!queue) return res.status(404).json({ message: 'Queue not found' });

    const entry = queue.queueEntries.id(entryId);
    if (!entry) return res.status(404).json({ message: 'Queue entry not found' });

    entry.status = 'in_service';
    entry.servedAt = new Date();
    await queue.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`shop:${queue.shopId}`).emit('queue:alert-approaching', {
        userId: entry.userId,
        ticketNumber: entry.ticketNumber,
        message: 'Your turn! Please proceed to the counter.',
      });
    }

    // Send push notification
    notifyTurnApproaching(entry.userId, entry.ticketNumber).catch(() => {});

    res.json({ message: 'Called next', entry });
  } catch (error) {
    next(error);
  }
};
