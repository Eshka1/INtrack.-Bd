const express = require('express');
const router = express.Router();

// Middlewares
const authGuard = require('../middlewares/authMiddleware');
const tenantGuard = require('../middlewares/tenantGuard');
const rbacGuard = require('../middlewares/rbacGuard');
const planLimitGate = require('../middlewares/planLimitGate');

// Controllers
const {
  createInventoryCategory,
  createRawMaterial,
  getInventoryOverview
} = require('../controllers/inventoryController');

const { processProductionOrder } = require('../controllers/orderController');
const { generateBalanceSheet } = require('../controllers/financeController');

// Apply global authentication and tenant-scoping to all API endpoints
router.use(authGuard);
router.use(tenantGuard);

// ---------------------------------------------------------------------------
// 1. Inventory & Raw Materials Endpoints
// ---------------------------------------------------------------------------
router.post(
  '/inventory/category',
  rbacGuard('inventory', 'create'),
  createInventoryCategory
);

router.post(
  '/inventory/material',
  rbacGuard('inventory', 'create'),
  planLimitGate('raw_materials'),
  createRawMaterial
);

router.get(
  '/inventory/overview',
  rbacGuard('inventory', 'read'),
  getInventoryOverview
);

// ---------------------------------------------------------------------------
// 2. Manufacturing & Production Order Execution (ACID Transactions)
// ---------------------------------------------------------------------------
router.post(
  '/orders/produce',
  rbacGuard('orders', 'create'),
  planLimitGate('orders'),
  processProductionOrder
);

// ---------------------------------------------------------------------------
// 3. Financial Reporting & Balance Sheet
// ---------------------------------------------------------------------------
router.get(
  '/finance/balance-sheet',
  rbacGuard('finance', 'read'),
  generateBalanceSheet
);

module.exports = router;