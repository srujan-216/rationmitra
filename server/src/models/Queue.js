const mongoose = require('mongoose');

const queueEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  ticketNumber: { type: String, required: true },
  status: {
    type: String,
    enum: ['waiting', 'in_service', 'completed', 'no_show', 'cancelled'],
    default: 'waiting',
  },
  counterId: { type: Number },
  joinedAt: { type: Date, default: Date.now },
  servedAt: { type: Date },
  completedAt: { type: Date },
  serviceTime: { type: Number },
});

const queueSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    date: { type: Date, required: true },
    slot: {
      slotId: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      capacity: { type: Number, required: true },
      currentCount: { type: Number, default: 0 },
    },
    queueEntries: [queueEntrySchema],
  },
  { timestamps: true }
);

queueSchema.index({ shopId: 1, date: 1, 'slot.slotId': 1 }, { unique: true });

module.exports = mongoose.model('Queue', queueSchema);
