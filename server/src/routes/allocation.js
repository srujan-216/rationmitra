const router = require('express').Router();
const allocationController = require('../controllers/allocationController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');

router.post('/', authenticate, authorize('admin', 'sysadmin'), allocationController.createAllocation);
router.post('/bulk', authenticate, authorize('admin', 'sysadmin'), allocationController.bulkCreateAllocations);
router.get('/all', authenticate, authorize('admin', 'sysadmin'), allocationController.getAllocations);
router.get('/my-shop', authenticate, authorize('shopowner'), allocationController.getShopAllocation);
router.put('/:id/acknowledge', authenticate, authorize('shopowner'), allocationController.acknowledgeReceipt);
router.get('/comparison', authenticate, authorize('admin', 'sysadmin'), allocationController.getAllocationComparison);

module.exports = router;
