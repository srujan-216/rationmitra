const mongoose = require('mongoose');

const distributionCommoditySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    entitledQty: { type: Number, required: true },
    distributedQty: { type: Number, required: true },
    rate: { type: Number, required: true },
  },
  { _id: false }
);

const distributionSchema = new mongoose.Schema(
  {
    rationCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RationCard',
      required: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    commodities: [distributionCommoditySchema],
    distributedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    verificationMethod: {
      type: String,
      enum: ['face', 'aadhaar', 'manual'],
      default: 'manual',
    },
    digitalSignatureHash: { type: String },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

distributionSchema.index({ rationCardId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Distribution', distributionSchema);
