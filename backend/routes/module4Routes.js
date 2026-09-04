const express = require("express");

const router = express.Router();

const auditController = require("../controllers/auditController");
const notificationController = require("../controllers/notificationController");
const exportController = require("../controllers/exportController");
const superAdminController = require("../controllers/superAdminController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");


// ===============================
// Historical Audit Trail Routes
// ===============================

// Create audit log
router.post(
    "/audit",
    authMiddleware,
    auditController.createAuditLog
);


// Get tenant audit history
router.get(
    "/audit",
    authMiddleware,
    auditController.getAuditLogs
);


// Get single audit record
router.get(
    "/audit/:id",
    authMiddleware,
    auditController.getAuditById
);



// ===============================
// SaaS Super Admin Routes
// ===============================


// View all registered tenants
router.get(
    "/admin/companies",
    authMiddleware,
    roleMiddleware("super_admin"),
    superAdminController.getAllCompanies
);


// Update subscription plan
router.patch(
    "/admin/subscription/:id",
    authMiddleware,
    roleMiddleware("super_admin"),
    superAdminController.updateSubscription
);


// Usage analytics
router.get(
    "/admin/analytics",
    authMiddleware,
    roleMiddleware("super_admin"),
    superAdminController.getAnalytics
);



// ===============================
// Data Export Routes
// ===============================


// Export Excel
router.get(
    "/export/excel",
    authMiddleware,
    exportController.exportExcel
);


// Export PDF
router.get(
    "/export/pdf",
    authMiddleware,
    exportController.exportPDF
);



// ===============================
// Notification Routes
// ===============================


// Get notifications
router.get(
    "/notifications",
    authMiddleware,
    notificationController.getNotifications
);


// Mark notification as read
router.patch(
    "/notifications/:id/read",
    authMiddleware,
    notificationController.markNotificationRead
);



module.exports = router;