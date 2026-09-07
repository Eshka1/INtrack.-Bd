require('dotenv').config();
const mongoose = require('mongoose');
const Warehouse = require('../models/Warehouse');
const OperationalStock = require('../src/modules/module2/models/OperationalStock');
const PurchaseOrder = require('../src/modules/module2/models/PurchaseOrder');
const ManufacturingRun = require('../src/modules/module2/models/ManufacturingRun');

const argument = (name) => {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);
};

async function run() {
  const tenantId = argument('tenant');
  const warehouseId = argument('warehouse');
  const legacyName = argument('legacy-name') || 'Main Warehouse Dock';
  if (!tenantId || !mongoose.isValidObjectId(warehouseId)) {
    throw new Error('Usage: node scripts/linkModule2Warehouse.js --tenant=<tenantId> --warehouse=<warehouseId> [--legacy-name=<name>]');
  }

  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  const warehouse = await Warehouse.findOne({ _id: warehouseId, tenantId, isActive: true });
  if (!warehouse) throw new Error('Active destination warehouse not found for this tenant');

  const filter = { tenantId, warehouse: { $exists: false }, warehouseName: legacyName };
  const update = { $set: { warehouse: warehouse._id, warehouseName: warehouse.name } };
  const [stock, purchaseOrders, manufacturingRuns] = await Promise.all([
    OperationalStock.updateMany(filter, update),
    PurchaseOrder.updateMany(filter, update),
    ManufacturingRun.updateMany(filter, update)
  ]);

  console.log(JSON.stringify({
    destination: warehouse.name,
    operationalStock: stock.modifiedCount,
    purchaseOrders: purchaseOrders.modifiedCount,
    manufacturingRuns: manufacturingRuns.modifiedCount
  }));
}

run()
  .then(() => mongoose.disconnect())
  .catch(async (error) => {
    console.error(error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
