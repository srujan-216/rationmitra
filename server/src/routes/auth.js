const router = require('express').Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerValidation, loginValidation } = require('../utils/validators');
const auditLog = require('../middleware/auditLogger');

router.post('/register', authLimiter, registerValidation, auditLog('register', 'user'), authController.register);
router.post('/login', authLimiter, loginValidation, auditLog('login', 'user'), authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticate, auditLog('logout', 'user'), authController.logout);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, auditLog('update_profile', 'user'), authController.updateProfile);

module.exports = router;
