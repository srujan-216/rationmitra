const mongoose = require('mongoose');

const timelineEntrySchema = new mongoose.Schema(
  {
    status: { type: String },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const grievanceSchema = new mongoose.Schema(
  {
    grievanceNumber: { type: String, unique: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['quality', 'quantity', 'denial', 'corruption', 'other'],
      required: true,
    },
    description: { type: String, required: true, maxlength: 2000 },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
    },
    attachmentUrl: { type: String },
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved', 'escalated'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolution: { type: String },
    timeline: [timelineEntrySchema],
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

/**
 * Auto-generate grievanceNumber on new documents.
 * Format: GRV-YYYYMM-XXXXX (random 5-digit suffix).
 */
grievanceSchema.pre('save', function (next) {
  if (this.isNew && !this.grievanceNumber) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const random = String(Math.floor(10000 + Math.random() * 90000)); // 5 digits
    this.grievanceNumber = `GRV-${yyyy}${mm}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Grievance', grievanceSchema);
