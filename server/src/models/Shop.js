const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      coordinates: { lat: Number, lng: Number },
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    operatingHours: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '18:00' },
    },
    slotsPerDay: { type: Number, default: 6 },
    slotDurationMinutes: { type: Number, default: 120 },
    maxCapacityPerSlot: { type: Number, default: 50 },
    counters: { type: Number, default: 2 },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

shopSchema.index({ owner: 1 });
shopSchema.index({ isActive: 1 });

module.exports = mongoose.model('Shop', shopSchema);
