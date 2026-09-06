require('dotenv').config();
const mongoose = require('mongoose');
const Supplier = require('../src/modules/module2/models/Supplier');
const PurchaseOrder = require('../src/modules/module2/models/PurchaseOrder');
const { CurrencySetting, DEFAULT_EXCHANGE_RATES } = require('../src/modules/finance/models/CurrencySetting');
const { convertCurrency } = require('../src/modules/finance/utils/money');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const suppliers = await Supplier.find({ 'products.currency': { $exists: false } });
  for (const supplier of suppliers) {
    supplier.products.forEach((product) => { if (!product.currency) product.currency = 'USD'; });
    await supplier.save();
  }
  const purchaseOrders = await PurchaseOrder.find({ $or: [{ currency: { $exists: false } }, { normalizedTotalCost: { $exists: false } }] });
  for (const po of purchaseOrders) {
    const setting = await CurrencySetting.findOne({ companyId: po.tenantId });
    const rates = setting?.exchangeRates instanceof Map ? Object.fromEntries(setting.exchangeRates) : (setting?.exchangeRates || DEFAULT_EXCHANGE_RATES);
    po.currency = po.currency || 'USD';
    po.normalizedTotalCost = convertCurrency(po.totalCost, po.currency, 'BDT', rates);
    po.exchangeRateSnapshot = rates[po.currency];
    await po.save();
  }
  console.log(`Updated ${suppliers.length} suppliers and ${purchaseOrders.length} purchase orders.`);
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
