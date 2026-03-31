const mongoose = require('mongoose');

const familyRequestSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['addition', 'deletion'],
      required: true,
    },
    rationCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RationCard',
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    memberDetails: {
      name: { type: String, trim: true },
      aadhaarNumber: { type: String, trim: true },
      relation: {
        type: String,
        enum: ['self', 'spouse', 'son', 'daughter', 'father', 'mother', 'other'],
      },
      dob: { type: Date },
      gender: {
        type: String,
        enum: ['male', 'female', 'other'],
      },
    },
    memberIndex: { type: Number },
    reason: { type: String, required: true, trim: true },
    certificateUrl: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewNotes: { type: String, trim: true },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FamilyRequest', familyRequestSchema);
