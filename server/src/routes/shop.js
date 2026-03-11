const router = require('express').Router();
const Shop = require('../models/Shop');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');

// List all active shops (for cardholders to browse)
router.get('/list', authenticate, async (req, res, next) => {
  try {
    const shops = await Shop.find({ isActive: true }).select('name code address operatingHours rating');
    res.json({ shops });
  } catch (error) {
    next(error);
  }
});

// Get single shop
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('owner', 'name email phone');
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json({ shop });
  } catch (error) {
    next(error);
  }
});

// Create shop (admin only)
router.post('/', authenticate, authorize('admin', 'sysadmin'), async (req, res, next) => {
  try {
    const shop = await Shop.create(req.body);
    res.status(201).json({ message: 'Shop created', shop });
  } catch (error) {
    next(error);
  }
});

// Update shop
router.put('/:id', authenticate, authorize('shopowner', 'admin', 'sysadmin'), async (req, res, next) => {
  try {
    const shop = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json({ message: 'Shop updated', shop });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
