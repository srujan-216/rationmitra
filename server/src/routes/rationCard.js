const router = require('express').Router();
const rationCardController = require('../controllers/rationCardController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const { uploadCertificate } = require('../middleware/upload');

// Static routes BEFORE parameterized routes
router.get('/my-card', authenticate, authorize('cardholder'), rationCardController.getMyCard);
router.get('/search', authenticate, authorize('admin', 'sysadmin'), rationCardController.searchCards);
router.post('/', authenticate, authorize('admin', 'sysadmin'), rationCardController.createCard);
router.post('/family-request', authenticate, authorize('cardholder'), uploadCertificate, rationCardController.submitFamilyRequest);
router.get('/family-requests/mine', authenticate, authorize('cardholder'), rationCardController.getMyFamilyRequests);
router.get('/family-requests/pending', authenticate, authorize('admin', 'sysadmin'), rationCardController.getPendingFamilyRequests);
router.put('/family-requests/:id/review', authenticate, authorize('admin', 'sysadmin'), rationCardController.reviewFamilyRequest);

// Parameterized routes AFTER static routes
router.put('/:id', authenticate, authorize('admin', 'sysadmin'), rationCardController.updateCard);
router.get('/:id', authenticate, authorize('admin', 'sysadmin'), rationCardController.getCardById);

module.exports = router;
