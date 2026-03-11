const mongoose = require('mongoose');

const fraudAlertSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
    alertType: {
      type: String,
      required: true,
      enum: [
        'duplicate_verification',
        'multiple_id_same_face',
        'repeated_failures',
        'unusual_pattern',
        'multiple_bookings',
        'suspicious_activity',
      ],
    },
    description: { type: String, required: true },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved', 'dismissed'],
      default: 'open',
    },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

fraudAlertSchema.index({ status: 1, severity: 1 });

module.exports = mongoose.model('FraudAlert', fraudAlertSchema);
