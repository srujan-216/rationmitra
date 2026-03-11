const router = require('express').Router();
const analyticsController = require('../controllers/analyticsController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');

router.get('/dashboard', authenticate, authorize('admin', 'sysadmin'), analyticsController.getDashboard);
router.get('/fraud-alerts', authenticate, authorize('admin', 'sysadmin'), analyticsController.getFraudAlerts);
router.put('/fraud-alerts/:id', authenticate, authorize('admin', 'sysadmin'), analyticsController.updateFraudAlert);
router.get('/audit-logs', authenticate, authorize('sysadmin'), analyticsController.getAuditLogs);
router.get('/shop-performance', authenticate, authorize('admin', 'sysadmin'), analyticsController.getShopPerformance);

module.exports = router;
