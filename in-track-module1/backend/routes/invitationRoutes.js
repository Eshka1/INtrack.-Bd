const express = require('express');
const router = express.Router();
const {
  createInvitation,
  getInvitations,
  revokeInvitation,
  verifyInvitation,
  acceptInvitation
} = require('../controllers/invitationController');
const { protect } = require('../middleware/auth');
const { enforceTenantIsolation } = require('../middleware/tenantIsolation');
const { authorize } = require('../middleware/rbac');
const { PERMISSIONS } = require('../config/permissions');

// Public routes — the invited person doesn't have an account or token yet
router.get('/verify/:token', verifyInvitation);
router.post('/accept/:token', acceptInvitation);

// Everything below requires an authenticated, tenant-scoped user
router.use(protect, enforceTenantIsolation);

router.route('/')
  .get(authorize(PERMISSIONS.TEAM_VIEW), getInvitations)
  .post(authorize(PERMISSIONS.TEAM_INVITE), createInvitation);

router.delete('/:id', authorize(PERMISSIONS.TEAM_INVITE), revokeInvitation);

module.exports = router;
