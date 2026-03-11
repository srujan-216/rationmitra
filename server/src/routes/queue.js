const router = require('express').Router();
const queueController = require('../controllers/queueController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const Shop = require('../models/Shop');

// Quick shops list for booking page
router.get('/shops-list', authenticate, async (req, res, next) => {
  try {
    const shops = await Shop.find({ isActive: true }).select('name code address');
    res.json({ shops });
  } catch (error) {
    next(error);
  }
});

router.get('/available-slots/:shopId/:date', authenticate, queueController.getAvailableSlots);
router.post('/book-slot', authenticate, authorize('cardholder'), queueController.bookSlot);
router.get('/my-bookings', authenticate, queueController.getMyBookings);
router.delete('/cancel-booking/:bookingId', authenticate, queueController.cancelBooking);
router.get('/live-status/:shopId', authenticate, queueController.getLiveStatus);
router.post('/mark-served', authenticate, authorize('shopowner', 'admin', 'sysadmin'), queueController.markServed);
router.post('/call-next', authenticate, authorize('shopowner', 'admin', 'sysadmin'), queueController.callNext);

module.exports = router;
