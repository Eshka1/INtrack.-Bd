const express = require('express');
const controller = require('../controllers/module2Controller');
const { protect } = require('../../../../middleware/auth');
const { enforceTenantIsolation } = require('../../../../middleware/tenantIsolation');
const { authorize } = require('../../../../middleware/rbac');
const { PERMISSIONS } = require('../../../../config/permissions');

const router = express.Router();
router.use(protect, enforceTenantIsolation);

router.route('/suppliers')
  .get(authorize(PERMISSIONS.PO_VIEW), controller.getSuppliers)
  .post(authorize(PERMISSIONS.PO_CREATE), controller.createSupplier);
router.route('/suppliers/:id')
  .put(authorize(PERMISSIONS.PO_CREATE), controller.updateSupplier)
  .delete(authorize(PERMISSIONS.PO_CREATE), controller.deleteSupplier);
router.route('/purchase-orders')
  .get(authorize(PERMISSIONS.PO_VIEW), controller.getPurchaseOrders)
  .post(authorize(PERMISSIONS.PO_CREATE), controller.createPurchaseOrder);
router.post('/purchase-orders/:poId/ingest', authorize(PERMISSIONS.PO_APPROVE), controller.ingestShipment);
router.route('/recipes')
  .get(authorize(PERMISSIONS.INVENTORY_VIEW), controller.getRecipes)
  .post(authorize(PERMISSIONS.RECIPE_MANAGE), controller.createRecipe);
router.delete('/recipes/:id', authorize(PERMISSIONS.RECIPE_MANAGE), controller.deleteRecipe);
router.post('/manufacturing/run', authorize(PERMISSIONS.MANUFACTURING_LOG), controller.executeManufacturingRun);
router.get('/inventory/alerts', authorize(PERMISSIONS.INVENTORY_VIEW), controller.getInventoryAndAlerts);

module.exports = router;
