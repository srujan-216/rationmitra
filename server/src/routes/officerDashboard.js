const router = require('express').Router();
const officerDashboardController = require('../controllers/officerDashboardController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');

router.get('/', authenticate, authorize('admin', 'sysadmin'), officerDashboardController.getOfficerDashboard);
router.get('/district/:district', authenticate, authorize('admin', 'sysadmin'), officerDashboardController.getDistrictDrilldown);
router.get('/mandal/:district/:mandal', authenticate, authorize('admin', 'sysadmin'), officerDashboardController.getMandalDrilldown);

module.exports = router;
