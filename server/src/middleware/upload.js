const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');

/**
 * Ensure a directory exists, creating it recursively if needed.
 */
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Build a Multer disk-storage engine for a given subfolder.
 */
const createStorage = (subfolder) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dest = path.join(UPLOAD_ROOT, subfolder);
      ensureDir(dest);
      cb(null, dest);
    },
    filename: (_req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

/**
 * Only allow JPEG, PNG, and PDF files.
 */
const fileFilter = (_req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and PDF files are allowed'), false);
  }
};

const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5 MB

/**
 * Upload middleware for certificate files (single file, field name: 'certificate').
 */
const uploadCertificate = multer({
  storage: createStorage('certificates'),
  limits: { fileSize: FILE_SIZE_LIMIT },
  fileFilter,
}).single('certificate');

/**
 * Upload middleware for generic attachment files (single file, field name: 'attachment').
 */
const uploadAttachment = multer({
  storage: createStorage('attachments'),
  limits: { fileSize: FILE_SIZE_LIMIT },
  fileFilter,
}).single('attachment');

module.exports = { uploadCertificate, uploadAttachment };
