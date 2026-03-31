const mongoose = require('mongoose');
const { CARD_TYPES } = require('../utils/telangana');

const familyMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    aadhaarNumber: { type: String, trim: true },
    relation: {
      type: String,
      enum: ['self', 'spouse', 'son', 'daughter', 'father', 'mother', 'other'],
      required: true,
    },
    dob: { type: Date },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    status: {
      type: String,
      enum: ['active', 'removed'],
      default: 'active',
    },
  },
  { _id: true }
);

const rationCardSchema = new mongoose.Schema(
  {
    cardNumber: { type: String, required: true, unique: true, trim: true },
    cardType: { type: String, enum: CARD_TYPES, required: true },
    headOfFamily: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    familyMembers: [familyMemberSchema],
    district: { type: String, required: true, trim: true },
    mandal: { type: String, required: true, trim: true },
    village: { type: String, trim: true },
    assignedFPS: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    isActive: { type: Boolean, default: true },
    aadhaarLinked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

rationCardSchema.index({ headOfFamily: 1 });
rationCardSchema.index({ assignedFPS: 1 });
rationCardSchema.index({ district: 1, mandal: 1 });

module.exports = mongoose.model('RationCard', rationCardSchema);
