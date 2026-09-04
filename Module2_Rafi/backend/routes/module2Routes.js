const express = require('express');
const router = express.Router();
const controller = require('../controllers/module2Controller');

// 2.1 Suppliers
router.route('/suppliers').post(controller.createSupplier).get(controller.getSuppliers);

// 2.2 POs
router.route('/purchase-orders').post(controller.createPurchaseOrder).get(controller.getPurchaseOrders);
router.route('/purchase-orders/:poId/ingest').post(controller.ingestShipment);

// 2.3 Recipes
router.route('/recipes').post(controller.createRecipe).get(controller.getRecipes);

// 2.4 Manufacturing
router.route('/manufacturing/run').post(controller.executeManufacturingRun);

// 2.5 Inventory & Stock Alerts
router.route('/inventory/alerts').get(controller.getInventoryAndAlerts);

module.exports = router;