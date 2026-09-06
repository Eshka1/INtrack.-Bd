const express = require('express');
const router = express.Router();
const controller = require('../controllers/module2Controller');

// ==========================================
// 2.1 Suppliers
// ==========================================
router.route('/suppliers')
  .get(controller.getSuppliers)
  .post(controller.createSupplier);

if (controller.updateSupplier) {
  router.route('/suppliers/:id').put(controller.updateSupplier);
}
if (controller.deleteSupplier) {
  router.route('/suppliers/:id').delete(controller.deleteSupplier);
}

// ==========================================
// 2.2 Purchase Orders & Ingestion
// ==========================================
if (controller.getPurchaseOrders && controller.createPurchaseOrder) {
  router.route('/purchase-orders')
    .get(controller.getPurchaseOrders)
    .post(controller.createPurchaseOrder);
}

// Support both endpoint patterns for PO Ingestion
if (controller.ingestShipment) {
  router.post('/purchase-orders/:poId/ingest', controller.ingestShipment);
  router.post('/po/ingest', controller.ingestShipment);
}

// ==========================================
// 2.3 BOM Recipes
// ==========================================
router.route('/recipes')
  .get(controller.getRecipes)
  .post(controller.createRecipe);

if (controller.deleteRecipe) {
  router.delete('/recipes/:id', controller.deleteRecipe);
}

// ==========================================
// 2.4 Manufacturing Execution
// ==========================================
// Support both /manufacturing/run and /manufacturing/execute
if (controller.executeManufacturingRun) {
  router.post('/manufacturing/run', controller.executeManufacturingRun);
  router.post('/manufacturing/execute', controller.executeManufacturingRun);
}

// ==========================================
// 2.5 Inventory Ledger & Stock Alerts
// ==========================================
if (controller.getInventoryAndAlerts) {
  router.get('/inventory/alerts', controller.getInventoryAndAlerts);
}

if (controller.getInventory) {
  router.get('/inventory', controller.getInventory);
}

if (controller.deleteInventory) {
  router.delete('/inventory/:id', controller.deleteInventory);
}

module.exports = router;