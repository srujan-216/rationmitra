const router = require('express').Router();
const Shop = require('../models/Shop');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const { haversineKm } = require('../utils/geo');

// List all active shops (for cardholders to browse)
router.get('/list', authenticate, async (req, res, next) => {
  try {
    const shops = await Shop.find({ isActive: true }).select('name code address operatingHours rating');
    res.json({ shops });
  } catch (error) {
    next(error);
  }
});

// Nearby shops — sorted by distance.
// Shops within `radius` km are marked `isNearby: true`.
// Others are still returned (for the "show all" fallback) but sorted by distance.
router.get('/nearby', authenticate, async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseFloat(req.query.radius) || 3;

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ message: 'Valid lat and lng are required' });
    }

    const shops = await Shop.find({ isActive: true })
      .select('name code address operatingHours rating slotsPerDay maxCapacityPerSlot counters')
      .lean();

    const enriched = shops
      .map((shop) => {
        const coords = shop.address && shop.address.coordinates;
        if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
          return { ...shop, distanceKm: null, isNearby: false };
        }
        const distanceKm = haversineKm(lat, lng, coords.lat, coords.lng);
        return {
          ...shop,
          distanceKm: Number(distanceKm.toFixed(2)),
          isNearby: distanceKm <= radius,
        };
      })
      .sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });

    const nearby = enriched.filter((s) => s.isNearby);
    const others = enriched.filter((s) => !s.isNearby);

    res.json({
      radiusKm: radius,
      userLocation: { lat, lng },
      nearbyCount: nearby.length,
      totalCount: enriched.length,
      nearby,
      others,
    });
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
