const router = require('express').Router();
const faceController = require('../controllers/faceController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');

router.post('/enroll', authenticate, faceController.enroll);
router.post('/verify', authenticate, authorize('shopowner', 'admin', 'sysadmin'), faceController.verify);
router.get('/enrollment-status/:userId', authenticate, faceController.getEnrollmentStatus);
router.put('/update', authenticate, faceController.updateEnrollment);

module.exports = router;
