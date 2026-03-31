const router = require('express').Router();
const grievanceController = require('../controllers/grievanceController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const { uploadAttachment } = require('../middleware/upload');

// Static routes BEFORE parameterized routes
router.post('/', authenticate, authorize('cardholder'), uploadAttachment, grievanceController.fileGrievance);
router.get('/mine', authenticate, authorize('cardholder'), grievanceController.getMyGrievances);
router.get('/stats', authenticate, authorize('admin', 'sysadmin'), grievanceController.getGrievanceStats);
router.get('/all', authenticate, authorize('admin', 'sysadmin'), grievanceController.getAllGrievances);

// Parameterized routes AFTER static routes
router.put('/:id/status', authenticate, authorize('admin', 'sysadmin'), grievanceController.updateGrievanceStatus);
router.get('/:id', authenticate, grievanceController.getGrievanceById);

module.exports = router;
