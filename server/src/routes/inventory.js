const router = require('express').Router();
const inventoryController = require('../controllers/inventoryController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');

// Static routes BEFORE parameterized routes to avoid conflicts
router.post('/update-stock', authenticate, authorize('shopowner', 'admin', 'sysadmin'), inventoryController.updateStock);
router.post('/set-reorder-level', authenticate, authorize('shopowner', 'admin', 'sysadmin'), inventoryController.setReorderLevel);
router.get('/forecast/:shopId', authenticate, inventoryController.getStockForecast);
router.get('/:shopId', authenticate, inventoryController.getShopInventory);

module.exports = router;
