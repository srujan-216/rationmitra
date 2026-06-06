const FaceData = require('../models/FaceData');
const mlService = require('../services/mlService');
const { encrypt, decrypt } = require('../utils/encryption');
const { checkVerificationFraud } = require('../services/fraudDetectionService');

const MAX_IMAGE_B64_BYTES = 4 * 1024 * 1024; // 4 MB base64 ≈ 3 MB raw

exports.enroll = async (req, res, next) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ message: 'Image (base64) is required' });
    if (Buffer.byteLength(image, 'utf8') > MAX_IMAGE_B64_BYTES) {
      return res.status(413).json({ message: 'Image too large. Maximum size is 3 MB.' });
    }

    // Check if already enrolled
    const existing = await FaceData.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(409).json({ message: 'Face already enrolled. Use update endpoint.' });
    }

    // Generate embedding via ML service
    const result = await mlService.generateFaceEmbedding(image);
    if (!result.embedding) {
      return res.status(400).json({ message: 'Failed to generate face embedding' });
    }

    // Encrypt embedding before storage
    const encryptedEmbedding = encrypt(JSON.stringify(result.embedding));

    const faceData = await FaceData.create({
      userId: req.user._id,
      faceEmbedding: encryptedEmbedding,
    });

    res.status(201).json({
      message: 'Face enrolled successfully',
      enrollmentId: faceData._id,
      dimensions: result.dimensions,
    });
  } catch (error) {
    next(error);
  }
};

exports.verify = async (req, res, next) => {
  try {
    const { userId, liveImage } = req.body;
    if (!userId || !liveImage) {
      return res.status(400).json({ message: 'userId and liveImage are required' });
    }

    const faceData = await FaceData.findOne({ userId, isActive: true });
    if (!faceData) {
      return res.status(404).json({ message: 'No face enrollment found for this user' });
    }

    // Decrypt stored embedding
    let storedEmbedding;
    try {
      storedEmbedding = JSON.parse(decrypt(faceData.faceEmbedding));
    } catch {
      return res.status(500).json({ message: 'Failed to decrypt stored face data. Re-enrollment required.' });
    }

    // Verify via ML service
    const result = await mlService.verifyFace(liveImage, storedEmbedding);

    // Update stats
    faceData.lastVerificationDate = new Date();
    faceData.verificationCount += 1;
    if (!result.verified) faceData.failureCount += 1;
    await faceData.save();

    // Run fraud detection check on failures
    if (!result.verified) {
      checkVerificationFraud(userId, 'Unknown', null).catch(() => {});
    }

    res.json({
      verified: result.verified,
      confidence: result.confidence,
      message: result.message,
      verificationCount: faceData.verificationCount,
      failureCount: faceData.failureCount,
    });
  } catch (error) {
    next(error);
  }
};

exports.getEnrollmentStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const faceData = await FaceData.findOne({ userId }).select('-faceEmbedding');

    if (!faceData) {
      return res.json({ enrolled: false });
    }

    res.json({
      enrolled: true,
      isActive: faceData.isActive,
      enrollmentDate: faceData.enrollmentDate,
      verificationCount: faceData.verificationCount,
      failureCount: faceData.failureCount,
      lastVerificationDate: faceData.lastVerificationDate,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateEnrollment = async (req, res, next) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ message: 'Image (base64) is required' });
    if (Buffer.byteLength(image, 'utf8') > MAX_IMAGE_B64_BYTES) {
      return res.status(413).json({ message: 'Image too large. Maximum size is 3 MB.' });
    }

    const result = await mlService.generateFaceEmbedding(image);
    if (!result.embedding) {
      return res.status(400).json({ message: 'Failed to generate face embedding' });
    }

    const encryptedEmbedding = encrypt(JSON.stringify(result.embedding));

    const faceData = await FaceData.findOneAndUpdate(
      { userId: req.user._id },
      { faceEmbedding: encryptedEmbedding, enrollmentDate: new Date(), failureCount: 0 },
      { new: true, upsert: true }
    );

    res.json({ message: 'Face enrollment updated', enrollmentId: faceData._id });
  } catch (error) {
    next(error);
  }
};
