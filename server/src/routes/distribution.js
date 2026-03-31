const router = require('express').Router();
const distributionController = require('../controllers/distributionController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');

router.post('/record', authenticate, authorize('shopowner'), distributionController.recordDistribution);
router.get('/my-history', authenticate, authorize('cardholder'), distributionController.getMyDistributions);
router.get('/receipt/:id', authenticate, distributionController.getDistributionReceipt);
router.get('/shop-distributions', authenticate, authorize('shopowner', 'admin', 'sysadmin'), distributionController.getShopDistributions);
router.get('/stats', authenticate, authorize('admin', 'sysadmin'), distributionController.getDistributionStats);
router.get('/check-entitlement/:cardId', authenticate, authorize('shopowner', 'admin', 'sysadmin'), distributionController.checkEntitlement);

module.exports = router;
