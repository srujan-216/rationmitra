require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/rationmitra',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret',
  jwtExpiry: '15m',
  jwtRefreshExpiry: '7d',
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:5001',
  encryptionKey: process.env.ENCRYPTION_KEY || 'default_32_char_encryption_key!!',
  bcryptSaltRounds: 12,
};
