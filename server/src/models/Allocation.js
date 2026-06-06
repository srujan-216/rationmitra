const mongoose = require('mongoose');

const allocationCommoditySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    allocatedQty: { type: Number, required: true },
    receivedQty: { type: Number, default: 0 },
    rate: { type: Number, required: true },
  },
  { _id: false }
);

const allocationSchema = new mongoose.Schema(
  {
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    district: { type: String, required: true, trim: true },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    commodities: [allocationCommoditySchema],
    status: {
      type: String,
      enum: ['planned', 'dispatched', 'partially_received', 'received', 'discrepancy'],
      default: 'planned',
    },
    dispatchDate: { type: Date },
    receiptDate: { type: Date },
    receiptAcknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

allocationSchema.index({ shopId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Allocation', allocationSchema);
