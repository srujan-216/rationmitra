const mongoose = require('mongoose');

const faceDataSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    faceEmbedding: { type: String, required: true }, // encrypted 128D embedding
    enrollmentDate: { type: Date, default: Date.now },
    lastVerificationDate: { type: Date },
    verificationCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FaceData', faceDataSchema);
